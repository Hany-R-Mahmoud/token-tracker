use std::net::TcpListener;
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, Position, Rect, RunEvent, WebviewUrl,
    WebviewWindowBuilder, WindowEvent, Wry,
};
static TRAY_COST_CENTS: AtomicU32 = AtomicU32::new(0);

struct AppState {
    tray: Mutex<Option<TrayIcon<Wry>>>,
    desktop_server: Mutex<Option<Child>>,
    runtime_endpoint: Mutex<Option<DesktopRuntimeEndpoint>>,
}

const DASHBOARD_WINDOW_LABEL: &str = "main";
const MENUBAR_WINDOW_LABEL: &str = "menubar";
const MENUBAR_WINDOW_WIDTH: i32 = 360;
const MENUBAR_WINDOW_HEIGHT: i32 = 520;
const DASHBOARD_PATH: &str = "/";
const MENUBAR_PATH: &str = "/menubar";
const DESKTOP_SUMMARY_PATH: &str = "/api/summary";
const DESKTOP_RUNTIME_STATUS_PATH: &str = "/api/runtime-status";
const DESKTOP_NOTIFICATION_PATH: &str = "/api/notification-check";

#[derive(Debug, Clone)]
struct DesktopRuntimeEndpoint {
    port: u16,
    instance_token: String,
    owner_path: String,
}

#[allow(dead_code)]
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesktopRuntimeStatusResponse {
    runtime_mode: String,
    database_path: String,
    total_session_count: usize,
    analytics_window_days: usize,
    analytics_window_session_count: usize,
    refresh_cadence_seconds: usize,
    db_exists: bool,
    started_at: String,
    instance_token: String,
    owner_path: String,
    port: u16,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExternalWindowInfo {
    pub external_window_id: String,
    pub title: Option<String>,
    pub app_name: Option<String>,
    pub process_id: Option<u32>,
    pub process_path: Option<String>,
    pub bounds: Option<WindowBounds>,
    pub is_active: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WindowBounds {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActiveSurfaceCapabilities {
    pub active_window_detection: String,
    pub open_window_registry: String,
    pub browser_url_enrichment: String,
    pub browser_native_messaging: String,
    pub desktop_notifications: String,
    pub attention_request: String,
}

impl Default for ActiveSurfaceCapabilities {
    fn default() -> Self {
        ActiveSurfaceCapabilities {
            active_window_detection: "unavailable".to_string(),
            open_window_registry: "unavailable".to_string(),
            browser_url_enrichment: "unavailable".to_string(),
            browser_native_messaging: "unavailable".to_string(),
            desktop_notifications: "unavailable".to_string(),
            attention_request: "unavailable".to_string(),
        }
    }
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesktopNotificationPayload {
    should_notify: bool,
    delivery: String,
    title: Option<String>,
    body: Option<String>,
    reason: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WindowSnapshot {
    pub windows: Vec<ExternalWindowInfo>,
    pub detected_at: String,
    pub source: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActiveSurfaceResult {
    pub resolution_tier: String,
    pub confidence: String,
    pub provider: Option<String>,
    pub provider_session_id: Option<String>,
    pub reason: String,
    pub source: String,
    pub capabilities: ActiveSurfaceCapabilities,
}

fn get_api_key() -> String {
    std::env::var("TTM_DESKTOP_API_KEY").unwrap_or_else(|_| "".to_string())
}

fn build_authenticated_url(base_url: &str) -> String {
    let api_key = get_api_key();
    if api_key.is_empty() {
        base_url.to_string()
    } else {
        format!("{}?api_key={}", base_url, api_key)
    }
}

fn runtime_url(port: u16, path: &str) -> String {
    format!("http://127.0.0.1:{}{}", port, path)
}

fn build_runtime_authenticated_url(port: u16, path: &str) -> String {
    build_authenticated_url(&runtime_url(port, path))
}

const SUPPORTED_PROVIDERS: &[&str] = &["Codex", "OpenCode", "Open Code", "Claude", "Cursor"];

fn is_supported_provider(app_name: &str) -> bool {
    let lower = app_name.to_lowercase();
    SUPPORTED_PROVIDERS
        .iter()
        .any(|p| lower.contains(&p.to_lowercase()))
}

fn map_provider(app_name: &str) -> Option<String> {
    let lower = app_name.to_lowercase();
    if lower.contains("codex") {
        Some("codex".to_string())
    } else if lower.contains("opencode") || lower.contains("open code") {
        Some("opencode".to_string())
    } else if lower.contains("claude") {
        Some("claude".to_string())
    } else if lower.contains("cursor") {
        Some("cursor".to_string())
    } else {
        None
    }
}

#[cfg(target_os = "macos")]
fn get_active_window_impl() -> WindowSnapshot {
    let now = chrono::Utc::now().to_rfc3339();

    let output = Command::new("osascript")
        .args([
            "-e",
            r#"
            tell application "System Events"
                set frontApp to first application process whose frontmost is true
                set appName to name of frontApp
                set appPath to ""
                try
                    set winCount to count of windows of frontApp
                    if winCount > 0 then
                        set winTitle to name of first window of frontApp
                        return appName & "|" & appPath & "|" & winTitle
                    end if
                end try
                return appName & "|" & appPath & "|" & "no title"
            end tell
            "#,
        ])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let stdout = String::from_utf8_lossy(&result.stdout);
                let parts: Vec<&str> = stdout.trim().split('|').collect();
                if parts.len() >= 3 {
                    let app_name = parts[0].to_string();
                    let process_path = if parts[1].trim().is_empty() {
                        None
                    } else {
                        Some(parts[1].to_string())
                    };
                    let title = if parts[2] == "no title" {
                        None
                    } else {
                        Some(parts[2].to_string())
                    };

                    let is_supported = is_supported_provider(&app_name);

                    return WindowSnapshot {
                        windows: vec![ExternalWindowInfo {
                            external_window_id: format!("macos-{}-0", app_name.replace(" ", "-").to_lowercase()),
                            title,
                            app_name: Some(app_name.clone()),
                            process_id: None,
                            process_path,
                            bounds: None,
                            is_active: true,
                        }],
                        detected_at: now,
                        source: if is_supported {
                            "native_macos_apple_script".to_string()
                        } else {
                            "native_macos_apple_script_unsupported".to_string()
                        },
                    };
                }
            }
        }
        Err(e) => log::warn!("Failed to get active window: {}", e),
    }

    WindowSnapshot {
        windows: vec![],
        detected_at: now,
        source: "native_macos_fallback".to_string(),
    }
}

#[cfg(not(target_os = "macos"))]
fn get_active_window_impl() -> WindowSnapshot {
    let now = chrono::Utc::now().to_rfc3339();
    WindowSnapshot {
        windows: vec![],
        detected_at: now,
        source: "unsupported_platform".to_string(),
    }
}

#[cfg(target_os = "macos")]
fn get_open_windows_impl() -> WindowSnapshot {
    let now = chrono::Utc::now().to_rfc3339();

    let output = Command::new("osascript")
        .args([
            "-e",
            r#"
            tell application "System Events"
                set windowList to ""
                repeat with proc in (every application process whose background only is false)
                    try
                        set appName to name of proc
                        set appPath to ""
                        set winCount to count of windows of proc
                        if winCount > 0 then
                            repeat with i from 1 to winCount
                                try
                                    set winTitle to name of window i of proc
                                    set windowList to windowList & appName & "|" & appPath & "|" & winTitle & "||"
                                end try
                            end repeat
                        end if
                    end try
                end repeat
                return windowList
            end tell
            "#,
        ])
        .output();

    let mut windows: Vec<ExternalWindowInfo> = vec![];

    if let Ok(result) = output {
        if result.status.success() {
            let stdout = String::from_utf8_lossy(&result.stdout);
            for entry in stdout.trim().split("||") {
                if entry.is_empty() {
                    continue;
                }
                let parts: Vec<&str> = entry.split('|').collect();
                if parts.len() >= 3 {
                    let app_name = parts[0].to_string();
                    let process_path = if parts[1].trim().is_empty() {
                        None
                    } else {
                        Some(parts[1].to_string())
                    };
                    let title = if parts[2].is_empty() || parts[2] == "no title" {
                        None
                    } else {
                        Some(parts[2].to_string())
                    };

                    windows.push(ExternalWindowInfo {
                        external_window_id: format!(
                            "macos-{}-{}",
                            app_name.replace(" ", "-"),
                            windows.len()
                        ),
                        title,
                        app_name: Some(app_name.clone()),
                        process_id: None,
                        process_path,
                        bounds: None,
                        is_active: false,
                    });
                }
            }
        }
    }

    let source = if windows.is_empty() {
        "native_macos_fallback".to_string()
    } else {
        "native_macos_apple_script".to_string()
    };

    WindowSnapshot {
        windows,
        detected_at: now,
        source,
    }
}

#[cfg(not(target_os = "macos"))]
fn get_open_windows_impl() -> WindowSnapshot {
    let now = chrono::Utc::now().to_rfc3339();
    WindowSnapshot {
        windows: vec![],
        detected_at: now,
        source: "unsupported_platform".to_string(),
    }
}

#[cfg(target_os = "macos")]
fn get_capabilities_impl() -> ActiveSurfaceCapabilities {
    let active_window = get_active_window_impl();
    let open_windows = get_open_windows_impl();

    let has_supported_windows = active_window
        .windows
        .iter()
        .any(|w| w.app_name.as_ref().map(|a| is_supported_provider(a)).unwrap_or(false))
        || open_windows.windows.iter().any(|w| {
            w.app_name
                .as_ref()
                .map(|a| is_supported_provider(a))
                .unwrap_or(false)
        });

    ActiveSurfaceCapabilities {
        active_window_detection: if has_supported_windows {
            "available".to_string()
        } else {
            "degraded".to_string()
        },
        open_window_registry: if !open_windows.windows.is_empty() {
            "available".to_string()
        } else {
            "degraded".to_string()
        },
        browser_url_enrichment: "unavailable".to_string(),
        browser_native_messaging: "unavailable".to_string(),
        desktop_notifications: "available".to_string(),
        attention_request: "available".to_string(),
    }
}

#[cfg(not(target_os = "macos"))]
fn get_capabilities_impl() -> ActiveSurfaceCapabilities {
    ActiveSurfaceCapabilities::default()
}

#[cfg(target_os = "macos")]
fn resolve_active_surface_impl() -> ActiveSurfaceResult {
    let caps = get_capabilities_impl();
    let active = get_active_window_impl();
    let open = get_open_windows_impl();

    let mut all_windows: Vec<&ExternalWindowInfo> = active.windows.iter().collect();
    for w in &open.windows {
        if !all_windows
            .iter()
            .any(|aw| aw.external_window_id == w.external_window_id)
        {
            all_windows.push(w);
        }
    }

    let provider_window = all_windows.iter().find(|w| {
        w.app_name
            .as_ref()
            .map(|a| is_supported_provider(a))
            .unwrap_or(false)
    });

    if let Some(window) = provider_window {
        if let Some(app_name) = &window.app_name {
            if let Some(provider) = map_provider(app_name) {
                let is_active = window.is_active;
                return ActiveSurfaceResult {
                    resolution_tier: if is_active {
                        "tier_2_provider_window".to_string()
                    } else {
                        "tier_3_provider_window_plus_candidate_session".to_string()
                    },
                    confidence: if is_active {
                        "medium".to_string()
                    } else {
                        "low".to_string()
                    },
                    provider: Some(provider),
                    provider_session_id: None,
                    reason: if is_active {
                        format!("Active {} window detected via native macOS", app_name)
                    } else {
                        format!("Open {} window found via native macOS", app_name)
                    },
                    source: if is_active {
                        "native_macos_apple_script".to_string()
                    } else {
                        "open_window_registry".to_string()
                    },
                    capabilities: caps,
                };
            }
        }
    }

    ActiveSurfaceResult {
        resolution_tier: "tier_1_latest_session".to_string(),
        confidence: "low".to_string(),
        provider: None,
        provider_session_id: None,
        reason: "No supported provider window found - using latest-session fallback".to_string(),
        source: "latest_session_fallback".to_string(),
        capabilities: caps,
    }
}

#[cfg(not(target_os = "macos"))]
fn resolve_active_surface_impl() -> ActiveSurfaceResult {
    ActiveSurfaceResult {
        resolution_tier: "tier_0_none".to_string(),
        confidence: "none".to_string(),
        provider: None,
        provider_session_id: None,
        reason: "Platform not supported".to_string(),
        source: "unsupported_platform".to_string(),
        capabilities: ActiveSurfaceCapabilities::default(),
    }
}

#[tauri::command]
fn get_active_window() -> Result<WindowSnapshot, String> {
    Ok(get_active_window_impl())
}

#[tauri::command]
fn get_open_windows() -> Result<WindowSnapshot, String> {
    Ok(get_open_windows_impl())
}

#[tauri::command]
fn get_active_surface_capabilities() -> ActiveSurfaceCapabilities {
    get_capabilities_impl()
}

#[tauri::command]
fn resolve_active_surface() -> Result<ActiveSurfaceResult, String> {
    Ok(resolve_active_surface_impl())
}

fn focus_window(app: &AppHandle, label: &str) {
    if let Some(window) = app.get_webview_window(label) {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn desktop_runtime_dir(app: &AppHandle) -> tauri::Result<PathBuf> {
    let resource_dir = app.path().resource_dir()?;
    let direct_runtime = resource_dir.join("runtime");
    if direct_runtime.exists() {
        return Ok(direct_runtime);
    }

    let tauri_bundle_runtime = resource_dir.join("_up_").join("runtime");
    if tauri_bundle_runtime.exists() {
        return Ok(tauri_bundle_runtime);
    }

    Ok(direct_runtime)
}

fn user_home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME").map(PathBuf::from)
}

fn current_owner_path() -> String {
    std::env::current_exe()
        .map(|path| path.display().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

fn new_runtime_instance_token(port: u16) -> String {
    format!(
        "ttm-runtime-{}-{}-{}",
        std::process::id(),
        port,
        chrono::Utc::now().timestamp_nanos_opt().unwrap_or_default()
    )
}

fn pick_available_port() -> tauri::Result<u16> {
    let listener = TcpListener::bind("127.0.0.1:0").map_err(tauri::Error::from)?;
    let port = listener.local_addr().map_err(tauri::Error::from)?.port();
    Ok(port)
}

fn desktop_server_is_ready(endpoint: &DesktopRuntimeEndpoint) -> bool {
    let request = ureq::get(&runtime_url(endpoint.port, DESKTOP_RUNTIME_STATUS_PATH))
        .timeout(Duration::from_millis(400));

    let Ok(response) = request.call() else {
        return false;
    };

    let Ok(body) = response.into_string() else {
        return false;
    };

    let Ok(runtime_status) = serde_json::from_str::<DesktopRuntimeStatusResponse>(&body) else {
        return false;
    };

    runtime_status.instance_token == endpoint.instance_token
        && runtime_status.owner_path == endpoint.owner_path
        && runtime_status.port == endpoint.port
}

fn wait_for_desktop_server_ready(endpoint: &DesktopRuntimeEndpoint, timeout: Duration) -> bool {
    let attempts = (timeout.as_millis() / 250).max(1) as usize;
    for _ in 0..attempts {
        if desktop_server_is_ready(endpoint) {
            return true;
        }
        std::thread::sleep(Duration::from_millis(250));
    }

    desktop_server_is_ready(endpoint)
}

fn runtime_endpoint(app: &AppHandle) -> Option<DesktopRuntimeEndpoint> {
    let state = app.try_state::<AppState>()?;
    let guard = state.runtime_endpoint.lock().ok()?;
    guard.clone()
}

fn stop_desktop_server(app: &AppHandle) {
    let Some(state) = app.try_state::<AppState>() else {
        return;
    };

    if let Ok(mut server_guard) = state.desktop_server.lock() {
        if let Some(mut child) = server_guard.take() {
            if let Err(error) = child.kill() {
                log::warn!("Failed to stop bundled desktop runtime: {}", error);
            }
            let _ = child.wait();
        }
    }

    let endpoint_lock = state.runtime_endpoint.lock();
    if let Ok(mut endpoint_guard) = endpoint_lock {
        *endpoint_guard = None;
    }
}

fn ensure_desktop_server(app: &AppHandle) -> tauri::Result<bool> {
    if let Some(endpoint) = runtime_endpoint(app) {
        if desktop_server_is_ready(&endpoint) {
            return Ok(true);
        }
    }

    let Some(state) = app.try_state::<AppState>() else {
        return Ok(false);
    };

    {
        let Ok(mut server_guard) = state.desktop_server.lock() else {
            log::warn!("Desktop server state lock was poisoned");
            return Ok(false);
        };

        let endpoint_ready = runtime_endpoint(app)
            .as_ref()
            .map(desktop_server_is_ready)
            .unwrap_or(false);
        let needs_spawn = match server_guard.as_mut() {
            Some(child) => {
                let child_exited = child.try_wait().ok().flatten().is_some();
                child_exited || !endpoint_ready
            }
            None => true,
        };

        if needs_spawn {
            if let Some(mut child) = server_guard.take() {
                if let Err(error) = child.kill() {
                    log::warn!("Failed to stop stale bundled desktop runtime before respawn: {}", error);
                }
                let _ = child.wait();
            }

            let runtime_dir = desktop_runtime_dir(app)?;
            let node_path = runtime_dir.join("bin/node");
            let server_entry = runtime_dir.join("apps/desktop/dist/index.js");
            let port = pick_available_port()?;
            let endpoint = DesktopRuntimeEndpoint {
                port,
                instance_token: new_runtime_instance_token(port),
                owner_path: current_owner_path(),
            };

            if !node_path.exists() || !server_entry.exists() {
                log::warn!(
                    "Bundled desktop runtime is missing. node: {:?}, entry: {:?}",
                    node_path,
                    server_entry
                );
                *server_guard = None;
                return Ok(false);
            }

            let child = Command::new(node_path)
                .arg(server_entry)
                .current_dir(&runtime_dir)
                .env("TTM_DESKTOP_PORT", endpoint.port.to_string())
                .env("TTM_DESKTOP_RUNTIME", "bundled")
                .env("TTM_RUNTIME_INSTANCE_TOKEN", &endpoint.instance_token)
                .env("TTM_RUNTIME_OWNER_PATH", &endpoint.owner_path)
                .envs(user_home_dir().map(|home| {
                    [
                        (
                            "TTM_DB_PATH".to_string(),
                            home.join(".ttm").join("ttm.sqlite").display().to_string(),
                        ),
                        (
                            "TTM_LEADERBOARD_DB_PATH".to_string(),
                            home.join(".ttm")
                                .join("leaderboard.sqlite")
                                .display()
                                .to_string(),
                        ),
                    ]
                }).into_iter().flatten())
                .spawn()
                .map_err(tauri::Error::from)?;

            *server_guard = Some(child);

            if let Ok(mut endpoint_guard) = state.runtime_endpoint.lock() {
                *endpoint_guard = Some(endpoint.clone());
            }
        }
    }

    if let Some(endpoint) = runtime_endpoint(app) {
        return Ok(wait_for_desktop_server_ready(&endpoint, Duration::from_secs(8)));
    }

    Ok(false)
}

#[cfg(target_os = "macos")]
fn escape_applescript_string(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

#[cfg(target_os = "macos")]
fn show_native_notification(title: &str, body: &str) {
    let script = format!(
        "display notification \"{}\" with title \"{}\"",
        escape_applescript_string(body),
        escape_applescript_string(title)
    );

    if let Err(error) = Command::new("osascript").args(["-e", &script]).output() {
        log::warn!("Failed to show native notification: {}", error);
    }
}

#[cfg(not(target_os = "macos"))]
fn show_native_notification(_title: &str, _body: &str) {}

fn show_dashboard_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window(DASHBOARD_WINDOW_LABEL) {
        if ensure_desktop_server(app)? {
            let Some(endpoint) = runtime_endpoint(app) else {
                return Ok(());
            };
            window.navigate(
                runtime_url(endpoint.port, DASHBOARD_PATH)
                    .parse()
                    .expect("dashboard URL should be valid"),
            )?;
        } else {
            log::warn!("Desktop server was not ready; leaving packaged fallback page visible");
        }
        let _ = window.show();
        let _ = window.set_focus();
    }

    Ok(())
}

fn rect_position_to_physical(rect: &Rect) -> PhysicalPosition<i32> {
    match rect.position {
        Position::Physical(position) => position.cast(),
        Position::Logical(position) => position.to_physical::<i32>(1.0),
    }
}

fn rect_size_to_physical_width_height(rect: &Rect) -> (i32, i32) {
    match rect.size {
        tauri::Size::Physical(size) => (size.width as i32, size.height as i32),
        tauri::Size::Logical(size) => {
            let physical = size.to_physical::<i32>(1.0);
            (physical.width as i32, physical.height as i32)
        }
    }
}

fn menubar_window_position_from_tray(rect: Rect) -> PhysicalPosition<i32> {
    let tray_position = rect_position_to_physical(&rect);
    let (tray_width, tray_height) = rect_size_to_physical_width_height(&rect);
    let x = tray_position.x + ((tray_width - MENUBAR_WINDOW_WIDTH) / 2);
    let y = tray_position.y + tray_height;

    PhysicalPosition::new(x.max(0), y.max(0))
}

fn position_menubar_window(
    app: &AppHandle,
    window: &tauri::WebviewWindow<Wry>,
    tray_rect: Option<Rect>,
) {
    let Some(rect) = tray_rect else {
        return;
    };

    let mut position = menubar_window_position_from_tray(rect);

    if let Ok(Some(monitor)) = app.primary_monitor() {
        let monitor_position = monitor.position();
        let monitor_size = monitor.size();
        let min_x = monitor_position.x;
        let max_x = monitor_position.x + monitor_size.width as i32 - MENUBAR_WINDOW_WIDTH;
        let min_y = monitor_position.y;
        let max_y = monitor_position.y + monitor_size.height as i32 - MENUBAR_WINDOW_HEIGHT;

        position.x = position.x.clamp(min_x, max_x.max(min_x));
        position.y = position.y.clamp(min_y, max_y.max(min_y));
    }

    let _ = window.set_position(position);
}

fn configure_menubar_window(window: &tauri::WebviewWindow<Wry>) {
    let window_clone = window.clone();
    window.on_window_event(move |event| match event {
        WindowEvent::Focused(false) => {
            let _ = window_clone.hide();
        }
        WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let _ = window_clone.hide();
        }
        _ => {}
    });
}

fn show_menubar_window(app: &AppHandle, tray_rect: Option<Rect>) -> tauri::Result<()> {
    if !ensure_desktop_server(app)? {
        log::warn!("Desktop server was not ready; skipping menu bar window creation");
        return Ok(());
    }

    if let Some(window) = app.get_webview_window(MENUBAR_WINDOW_LABEL) {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
            return Ok(());
        }
        let Some(endpoint) = runtime_endpoint(app) else {
            return Ok(());
        };
        position_menubar_window(app, &window, tray_rect);
        let _ = window.navigate(
            runtime_url(endpoint.port, MENUBAR_PATH)
                .parse()
                .expect("menu bar URL should be valid"),
        );
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }

    let window = WebviewWindowBuilder::new(
        app,
        MENUBAR_WINDOW_LABEL,
        WebviewUrl::External(
            runtime_url(
                runtime_endpoint(app)
                    .map(|endpoint| endpoint.port)
                    .expect("runtime endpoint should exist before creating menu bar window"),
                MENUBAR_PATH,
            )
                .parse()
                .expect("menu bar URL should be valid"),
        ),
    )
    .title("Token Tracker Menu Bar")
    .inner_size(MENUBAR_WINDOW_WIDTH as f64, MENUBAR_WINDOW_HEIGHT as f64)
    .resizable(false)
    .decorations(false)
    .visible(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .build()?;

    configure_menubar_window(&window);
    position_menubar_window(app, &window, tray_rect);
    focus_window(app, MENUBAR_WINDOW_LABEL);

    Ok(())
}

/// Update the tray title to show the current spend.
/// On macOS, this renders text beside the tray icon in the menu bar.
/// On other platforms, the title may not be visible — the menubar popover
/// still shows the full spend hero section.
pub fn update_tray_title(app: &AppHandle, total_cost_usd: f64) {
    let cents = (total_cost_usd * 100.0).round() as u32;
    TRAY_COST_CENTS.store(cents, Ordering::Relaxed);

    let title = if total_cost_usd >= 100.0 {
        format!("${:.0}", total_cost_usd)
    } else if total_cost_usd >= 1.0 {
        format!("${:.2}", total_cost_usd)
    } else {
        format!("${:.2}", total_cost_usd)
    };

    if let Some(state) = app.try_state::<AppState>() {
        if let Ok(tray_guard) = state.tray.lock() {
            if let Some(tray) = tray_guard.as_ref() {
                let _ = tray.set_title(Some(&title));
                let _ = tray.set_tooltip(Some(&format!("Token Tracker — {} total", title)));
            }
        }
    }
}

/// Get the last set tray cost in cents (for polling/fallback).
pub fn get_tray_cost_cents() -> u32 {
    TRAY_COST_CENTS.load(Ordering::Relaxed)
}

/// Fetch spend data from the desktop server and update the tray title.
/// Called periodically to keep the tray title in sync with real data.
fn poll_spend_and_update_tray(app: &AppHandle) {
    let app_handle = app.clone();
    std::thread::spawn(move || {
        let Some(endpoint) = runtime_endpoint(&app_handle) else {
            return;
        };
        let url = build_runtime_authenticated_url(endpoint.port, DESKTOP_SUMMARY_PATH);

        let request = ureq::get(&url).timeout(Duration::from_secs(5));
        let response = request.call();

        match response {
            Ok(res) => {
                if let Ok(body) = res.into_string() {
                    // Parse JSON to extract totalCost from stat cards
                    // The /api/summary endpoint returns: { databasePath, sessionCount, providerSummaries }
                    // We need to sum up totalCostUsd from providerSummaries
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&body) {
                        if let Some(providers) =
                            json.get("providerSummaries").and_then(|v| v.as_array())
                        {
                            let total: f64 = providers
                                .iter()
                                .filter_map(|p| p.get("totalCostUsd").and_then(|v| v.as_f64()))
                                .sum();
                            update_tray_title(&app_handle, total);
                        }
                    }
                }
            }
            Err(_) => {
                // Desktop server not running yet — keep $0.00
            }
        }
    });
}

fn poll_notification_and_deliver(app: &AppHandle) {
    let app_handle = app.clone();
    std::thread::spawn(move || {
        let Some(endpoint) = runtime_endpoint(&app_handle) else {
            return;
        };
        let url = build_runtime_authenticated_url(endpoint.port, DESKTOP_NOTIFICATION_PATH);
        let request = ureq::get(&url).timeout(Duration::from_secs(5));

        match request.call() {
            Ok(response) => {
                if let Ok(body) = response.into_string() {
                    match serde_json::from_str::<DesktopNotificationPayload>(&body) {
                        Ok(payload) => {
                            if payload.should_notify {
                                if let (Some(title), Some(body)) =
                                    (payload.title.as_deref(), payload.body.as_deref())
                                {
                                    show_native_notification(title, body);
                                }
                            } else if payload.delivery == "desktop_notification" {
                                log::info!("Notification gate closed: {}", payload.reason);
                            }
                        }
                        Err(error) => {
                            log::warn!("Failed to parse desktop notification payload: {}", error);
                        }
                    }
                }
            }
            Err(error) => {
                log::debug!("Notification poll skipped: {}", error);
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_active_window,
            get_open_windows,
            get_active_surface_capabilities,
            resolve_active_surface
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let open_dashboard =
                MenuItem::with_id(app, "open-dashboard", "Open Dashboard", true, None::<&str>)?;
            let open_menubar =
                MenuItem::with_id(app, "open-menubar", "Open Menu Bar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open_menubar, &open_dashboard, &quit])?;

            let tray = tauri::tray::TrayIconBuilder::with_id("main_tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .title("$0.00")
                .tooltip("Token Tracker — $0.00 total")
                .show_menu_on_left_click(false)
                .on_menu_event(move |app: &AppHandle, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "open-dashboard" => {
                        let _ = show_dashboard_window(app);
                    }
                    "open-menubar" => {
                        let _ = show_menubar_window(app, None);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray: &TrayIcon, event| {
                    if let TrayIconEvent::Click {
                        rect,
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let _ = show_menubar_window(&tray.app_handle(), Some(rect));
                    }
                })
                .build(app)?;

            app.manage(AppState {
                tray: Mutex::new(Some(tray)),
                desktop_server: Mutex::new(None),
                runtime_endpoint: Mutex::new(None),
            });

            // Show dashboard window
            let _ = show_dashboard_window(app.handle());

            // Poll spend data and update tray title every 30 seconds
            let app_handle = app.handle().clone();
            poll_spend_and_update_tray(&app_handle); // Initial poll
            poll_notification_and_deliver(&app_handle);
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(30));
                poll_spend_and_update_tray(&app_handle);
                poll_notification_and_deliver(&app_handle);
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app, event| {
        if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
            stop_desktop_server(app);
        }
    });
}
