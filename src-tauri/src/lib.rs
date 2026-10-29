use std::{fs, path::PathBuf, process::Command, time::UNIX_EPOCH};

use serde::Serialize;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ReportFile {
  name: String,
  modified_ms: u64,
}

// Aceita apenas nomes simples, para que nenhum caminho saia da pasta de relatórios.
fn is_safe_name(name: &str) -> bool {
  !name.is_empty()
    && name.len() <= 120
    && !name.starts_with('.')
    && name
      .chars()
      .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
}

fn reports_dir(app: &AppHandle, agent: Option<&str>) -> Result<PathBuf, String> {
  let root = app
    .path()
    .document_dir()
    .map_err(|error| error.to_string())?
    .join("Dock de Agentes")
    .join("Relatórios");
  match agent {
    Some(agent) if !is_safe_name(agent) => Err("Agente inválido".into()),
    Some(agent) => Ok(root.join(agent)),
    None => Ok(root),
  }
}

fn report_path(app: &AppHandle, agent: &str, file_name: &str) -> Result<PathBuf, String> {
  if !is_safe_name(file_name) || !file_name.ends_with(".md") {
    return Err("Nome de relatório inválido".into());
  }
  Ok(reports_dir(app, Some(agent))?.join(file_name))
}

#[tauri::command]
fn save_report(app: AppHandle, agent: String, file_name: String, content: String) -> Result<String, String> {
  let path = report_path(&app, &agent, &file_name)?;
  if let Some(dir) = path.parent() {
    fs::create_dir_all(dir).map_err(|error| error.to_string())?;
  }
  fs::write(&path, content).map_err(|error| error.to_string())?;
  Ok(path.display().to_string())
}

#[tauri::command]
fn list_reports(app: AppHandle, agent: String) -> Result<Vec<ReportFile>, String> {
  let dir = reports_dir(&app, Some(&agent))?;
  let Ok(entries) = fs::read_dir(&dir) else {
    return Ok(Vec::new());
  };

  let mut reports: Vec<ReportFile> = entries
    .flatten()
    .filter_map(|entry| {
      let name = entry.file_name().into_string().ok()?;
      if !name.ends_with(".md") {
        return None;
      }
      let modified_ms = entry
        .metadata()
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
        .map_or(0, |duration| duration.as_millis() as u64);
      Some(ReportFile { name, modified_ms })
    })
    .collect();
  reports.sort_by(|a, b| b.modified_ms.cmp(&a.modified_ms));
  Ok(reports)
}

#[tauri::command]
fn open_report(app: AppHandle, agent: String, file_name: String) -> Result<(), String> {
  let path = report_path(&app, &agent, &file_name)?;
  if !path.is_file() {
    return Err("Relatório não encontrado".into());
  }
  Command::new("explorer").arg(path).spawn().map_err(|error| error.to_string())?;
  Ok(())
}

#[tauri::command]
fn open_reports_folder(app: AppHandle, agent: Option<String>) -> Result<(), String> {
  let dir = reports_dir(&app, agent.as_deref())?;
  fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
  Command::new("explorer").arg(dir).spawn().map_err(|error| error.to_string())?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      save_report,
      list_reports,
      open_report,
      open_reports_folder
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
