use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
  AppHandle, Manager, WebviewUrl, WebviewWindowBuilder,
};

struct AppState {
  _tray: TrayIcon,
}

const DASHBOARD_WINDOW_LABEL: &str = "main";
const MENUBAR_WINDOW_LABEL: &str = "menubar";
const MENUBAR_URL: &str = "http://localhost:3100/menubar";

fn focus_window(app: &AppHandle, label: &str) {
  if let Some(window) = app.get_webview_window(label) {
    let _ = window.show();
    let _ = window.set_focus();
  }
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
      let menu = Menu::with_items(app, &[&open_dashboard, &quit])?;

      let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(move |app, event| match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          "open-dashboard" => {
            focus_window(app, DASHBOARD_WINDOW_LABEL);
          }
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
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

      app.manage(AppState { _tray: tray });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
