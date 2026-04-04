use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconEvent},
    AppHandle, Manager, WebviewUrl, WebviewWindowBuilder, Wry,
};

static TRAY_COST_CENTS: AtomicU32 = AtomicU32::new(0);

struct AppState {
    tray: Mutex<Option<TrayIcon<Wry>>>,
}

const DASHBOARD_WINDOW_LABEL: &str = "main";
const MENUBAR_WINDOW_LABEL: &str = "menubar";
const DASHBOARD_URL: &str = "http://localhost:3100/";
const MENUBAR_URL: &str = "http://localhost:3100/menubar";
const DESKTOP_API_URL: &str = "http://localhost:3100/api/summary";

fn focus_window(app: &AppHandle, label: &str) {
    if let Some(window) = app.get_webview_window(label) {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn show_dashboard_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window(DASHBOARD_WINDOW_LABEL) {
        window.navigate(
            DASHBOARD_URL
                .parse()
                .expect("dashboard URL should be a valid constant"),
        )?;
        let _ = window.show();
        let _ = window.set_focus();
    }

    Ok(())
}

fn show_menubar_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window(MENUBAR_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        MENUBAR_WINDOW_LABEL,
        WebviewUrl::External(
            MENUBAR_URL
                .parse()
                .expect("menu bar URL should be a valid constant"),
        ),
    )
    .title("Token Tracker Menu Bar")
    .inner_size(360.0, 520.0)
    .resizable(false)
    .decorations(false)
    .always_on_top(true)
    .visible_on_all_workspaces(true)
    .skip_taskbar(true)
    .build()?;

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
        // Use a simple HTTP GET to fetch the summary
        let response = ureq::get(DESKTOP_API_URL)
            .timeout(Duration::from_secs(5))
            .call();

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
                .show_menu_on_left_click(true)
                .on_menu_event(move |app: &AppHandle, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "open-dashboard" => {
                        let _ = show_dashboard_window(app);
                    }
                    "open-menubar" => {
                        let _ = show_menubar_window(app);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray: &TrayIcon, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let _ = show_menubar_window(&tray.app_handle());
                    }
                })
                .build(app)?;

            app.manage(AppState {
                tray: Mutex::new(Some(tray)),
            });

            // Show dashboard window
            let _ = show_dashboard_window(app.handle());

            // Poll spend data and update tray title every 30 seconds
            let app_handle = app.handle().clone();
            poll_spend_and_update_tray(&app_handle); // Initial poll
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(30));
                poll_spend_and_update_tray(&app_handle);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
