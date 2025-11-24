#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/Backend"
FRONTEND_DIR="$ROOT_DIR/Front"

NODE_TARGET_MAJOR="${NODE_TARGET_MAJOR:-20}" 
NODE_MIN_MAJOR="${NODE_MIN_MAJOR:-18}"      
POSTGRES_VERSION="${POSTGRES_VERSION:-16}"    
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-fracturas}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-123}"
PKG_INSTALLER="${PKG_INSTALLER:-bun}"         
ADMIN_EMAIL="${ADMIN_EMAIL:-Admin@admin.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Clave123}"
ADMIN_RUT="${ADMIN_RUT:-111111111}"

SUDO=""
if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
fi

info() { printf '[setup] %s\n' "$*"; }
warn() { printf '[setup][WARN] %s\n' "$*" >&2; }
fail() { printf '[setup][ERROR] %s\n' "$*" >&2; exit 1; }

PKG_MGR=""
detect_pkg_manager() {
  for mgr in apt-get dnf yum pacman zypper apk brew; do
    if command -v "$mgr" >/dev/null 2>&1; then
      PKG_MGR="$mgr"
      return
    fi
  done
}

refresh_repos_once() {
  case "$PKG_MGR" in
    apt-get)
      if [[ -z "${APT_UPDATED:-}" ]]; then
        $SUDO apt-get update -y
        APT_UPDATED=1
      fi
      ;;
    dnf|yum)
      if [[ -z "${DNF_UPDATED:-}" ]]; then
        $SUDO "$PKG_MGR" makecache -y
        DNF_UPDATED=1
      fi
      ;;
    pacman)
      if [[ -z "${PACMAN_UPDATED:-}" ]]; then
        $SUDO pacman -Sy --noconfirm
        PACMAN_UPDATED=1
      fi
      ;;
    zypper)
      if [[ -z "${ZYPPER_UPDATED:-}" ]]; then
        $SUDO zypper refresh
        ZYPPER_UPDATED=1
      fi
      ;;
    apk)
      if [[ -z "${APK_UPDATED:-}" ]]; then
        $SUDO apk update
        APK_UPDATED=1
      fi
      ;;
    brew)
      ;; # brew actualiza al instalar
  esac
}

ensure_curl() {
  if command -v curl >/dev/null 2>&1; then
    return
  fi
  detect_pkg_manager
  [[ -n "$PKG_MGR" ]] || fail "No se encontró gestor de paquetes para instalar curl."
  refresh_repos_once
  case "$PKG_MGR" in
    apt-get) $SUDO apt-get install -y curl ;;
    dnf|yum) $SUDO "$PKG_MGR" install -y curl ;;
    pacman)  $SUDO pacman -Sy --noconfirm curl ;;
    zypper)  $SUDO zypper install -y curl ;;
    apk)     $SUDO apk add curl ;;
    brew)    brew install curl ;;
    *) fail "Instalación de curl no implementada para $PKG_MGR" ;;
  esac
}

install_node() {
  detect_pkg_manager
  [[ -n "$PKG_MGR" ]] || fail "No se detectó gestor de paquetes (apt/dnf/yum/pacman/zypper/apk/brew)."
  refresh_repos_once

  case "$PKG_MGR" in
    apt-get)
      $SUDO apt-get install -y ca-certificates curl gnupg
      curl -fsSL "https://deb.nodesource.com/setup_${NODE_TARGET_MAJOR}.x" | $SUDO bash -
      $SUDO apt-get install -y nodejs
      ;;
    dnf|yum)
      $SUDO "$PKG_MGR" install -y curl
      curl -fsSL "https://rpm.nodesource.com/setup_${NODE_TARGET_MAJOR}.x" | $SUDO bash -
      $SUDO "$PKG_MGR" install -y nodejs
      ;;
    pacman)
      $SUDO pacman -Sy --noconfirm nodejs
      ;;
    zypper)
      $SUDO zypper install -y nodejs
      ;;
    apk)
      $SUDO apk add nodejs
      ;;
    brew)
      brew install node
      ;;
    *)
      fail "Instalación de Node no implementada para $PKG_MGR"
      ;;
  esac
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
    if [[ "$major" =~ ^[0-9]+$ ]] && (( major >= NODE_MIN_MAJOR )); then
      info "Node $(node -v) detectado, no se reinstala."
      return
    fi
    warn "Node $(node -v) es menor que ${NODE_MIN_MAJOR}, se instalará Node ${NODE_TARGET_MAJOR}.x"
  else
    info "Node no detectado, se instalará Node ${NODE_TARGET_MAJOR}.x"
  fi
  install_node
}

install_postgres() {
  detect_pkg_manager
  [[ -n "$PKG_MGR" ]] || fail "No se detectó gestor de paquetes para instalar PostgreSQL."
  refresh_repos_once

  case "$PKG_MGR" in
    apt-get)
      if ! $SUDO apt-get install -y "postgresql-${POSTGRES_VERSION}" "postgresql-contrib"; then
        warn "No se pudo instalar PostgreSQL ${POSTGRES_VERSION}, probando paquete por defecto de la distro."
        $SUDO apt-get install -y postgresql postgresql-contrib
      fi
      ;;
    dnf|yum)
      $SUDO "$PKG_MGR" install -y "postgresql${POSTGRES_VERSION/./}"-server postgresql-contrib || \
      $SUDO "$PKG_MGR" install -y postgresql-server postgresql-contrib
      if command -v postgresql-setup >/dev/null 2>&1; then
        $SUDO postgresql-setup --initdb || true
      fi
      ;;
    pacman)
      $SUDO pacman -Sy --noconfirm postgresql
      ;;
    zypper)
      $SUDO zypper install -y postgresql-server
      ;;
    apk)
      $SUDO apk add postgresql postgresql-contrib
      ;;
    brew)
      brew install "postgresql@${POSTGRES_VERSION}" || brew install postgresql
      ;;
    *)
      fail "Instalación de PostgreSQL no implementada para $PKG_MGR"
      ;;
  esac
}

ensure_postgres() {
  if command -v psql >/dev/null 2>&1; then
    info "PostgreSQL ya está instalado."
  else
    info "Instalando PostgreSQL..."
    install_postgres
  fi

  # Intentar iniciar el servicio
  if command -v systemctl >/dev/null 2>&1; then
    for svc in postgresql "postgresql@${POSTGRES_VERSION}-main" "postgresql-${POSTGRES_VERSION}" "postgresql${POSTGRES_VERSION/./}"; do
      if $SUDO systemctl enable --now "$svc" >/dev/null 2>&1; then
        info "Servicio $svc iniciado."
        return
      fi
    done
    warn "No se pudo habilitar/arrancar el servicio postgresql; inicia manualmente si es necesario."
  elif command -v service >/dev/null 2>&1; then
    $SUDO service postgresql start || warn "No se pudo iniciar servicio postgresql; inicia manualmente si es necesario."
  else
    warn "No se encontró systemctl/service; inicia PostgreSQL manualmente."
  fi
}

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    info "Bun $(bun -v) detectado, no se reinstala."
    return
  fi
  info "Instalando Bun..."
  ensure_curl
  local install_dir="${BUN_INSTALL:-$HOME/.bun}"
  BUN_INSTALL="$install_dir" bash -c "curl -fsSL https://bun.sh/install | bash" || fail "No se pudo instalar Bun"
  # Actualizar PATH para esta sesión
  export PATH="$install_dir/bin:$PATH"
  info "Bun instalado en $install_dir (añade '$install_dir/bin' a tu PATH si no lo está)"
}

escape_sql() {
  printf "%s" "$1" | sed "s/'/''/g"
}

HBA_FILE=""
HBA_BACKUP=""

detect_hba_file() {
  if [[ -n "${HBA_FILE}" && -f "${HBA_FILE}" ]]; then
    info "Usando pg_hba.conf en ${HBA_FILE}"
    return
  fi

  # 1) Usar pg_lsclusters (Debian/Ubuntu)
  if command -v pg_lsclusters >/dev/null 2>&1; then
    local line ver name candidate
    line=$(pg_lsclusters --no-header 2>/dev/null | head -n1 || true)
    if [[ -n "$line" ]]; then
      ver=$(echo "$line" | awk '{print $1}')
      name=$(echo "$line" | awk '{print $2}')
      candidate="/etc/postgresql/${ver}/${name}/pg_hba.conf"
      if [[ -f "$candidate" ]]; then
        HBA_FILE="$candidate"
        info "Usando pg_hba.conf en ${HBA_FILE}"
        return
      fi
    fi
  fi

  # 2) Usar SHOW hba_file si psql permite consultar sin password
  if command -v psql >/dev/null 2>&1; then
    local path
    path=$($SUDO -u postgres psql -w -tAc "SHOW hba_file;" 2>/dev/null | tr -d '[:space:]')
    if [[ -z "$path" ]]; then
      path=$(psql -w -tAc "SHOW hba_file;" 2>/dev/null | tr -d '[:space:]')
    fi
    if [[ -n "$path" && -f "$path" ]]; then
      HBA_FILE="$path"
      info "Usando pg_hba.conf en ${HBA_FILE}"
      return
    fi
  fi

  # 3) Revisar rutas típicas
  local candidates=(
    /etc/postgresql/*/*/pg_hba.conf
    /var/lib/postgresql/data/pg_hba.conf
    /var/lib/postgresql/*/pg_hba.conf
    /var/lib/pgsql/data/pg_hba.conf
    /usr/local/var/postgres/pg_hba.conf
    /opt/homebrew/var/postgres/pg_hba.conf
    /opt/homebrew/var/postgresql@*/pg_hba.conf
  )
  local c
  for c in "${candidates[@]}"; do
    for f in $c; do
      if [[ -f "$f" ]]; then
        HBA_FILE="$f"
        info "Usando pg_hba.conf en ${HBA_FILE}"
        return
      fi
    done
  done

  # 4) Búsqueda acotada
  local found
  found=$(find /etc /var/lib/postgresql /var/lib/pgsql /usr/local/var /opt/homebrew/var -maxdepth 5 -name pg_hba.conf 2>/dev/null | head -n1 || true)
  if [[ -n "$found" && -f "$found" ]]; then
    HBA_FILE="$found"
    info "Usando pg_hba.conf en ${HBA_FILE}"
  fi
}

relax_hba_auth() {
  detect_hba_file
  if [[ -z "$HBA_FILE" ]]; then
    warn "No se pudo localizar pg_hba.conf; no se ajustará autenticación."
    return 1
  fi

  if [[ -z "$HBA_BACKUP" ]]; then
    HBA_BACKUP="${HBA_FILE}.setup.bak"
    $SUDO cp "$HBA_FILE" "$HBA_BACKUP"
  fi

  $SUDO sed -i \
    -e 's/^local[[:space:]]\+all[[:space:]]\+postgres[[:space:]].*/local   all             postgres                                trust/' \
    -e 's/^local[[:space:]]\+all[[:space:]]\+all[[:space:]].*/local   all             all                                     trust/' \
    "$HBA_FILE" || warn "No se pudo editar $HBA_FILE"

  if ! grep -Eq '^local[[:space:]]+all[[:space:]]+postgres[[:space:]]+trust' "$HBA_FILE"; then
    { echo "local   all             postgres                                trust"; cat "$HBA_FILE"; } | $SUDO tee "$HBA_FILE.tmp" >/dev/null
    $SUDO mv "$HBA_FILE.tmp" "$HBA_FILE"
  fi
  if ! grep -Eq '^local[[:space:]]+all[[:space:]]+all[[:space:]]+trust' "$HBA_FILE"; then
    { echo "local   all             all                                     trust"; cat "$HBA_FILE"; } | $SUDO tee "$HBA_FILE.tmp" >/dev/null
    $SUDO mv "$HBA_FILE.tmp" "$HBA_FILE"
  fi

  if command -v systemctl >/dev/null 2>&1; then
    $SUDO systemctl reload postgresql || true
  elif command -v service >/dev/null 2>&1; then
    $SUDO service postgresql reload || true
  fi
}

restore_hba_auth() {
  if [[ -n "$HBA_BACKUP" && -f "$HBA_BACKUP" ]]; then
    $SUDO mv "$HBA_BACKUP" "$HBA_FILE" || true
    if command -v systemctl >/dev/null 2>&1; then
      $SUDO systemctl reload postgresql || true
    elif command -v service >/dev/null 2>&1; then
      $SUDO service postgresql reload || true
    fi
  fi
}

build_psql_cmd() {
  local PSQL_CMD=()
  local PSQL_ENV=()
  local HOST_ARGS=()
  local PSQL_FLAGS=("-w") 


  if [[ -n "${PGHOST:-}" && "${PGHOST}" != "localhost" && "${PGHOST}" != "127.0.0.1" ]]; then
    HOST_ARGS+=("-h" "${PGHOST}")
    PSQL_ENV+=("PGHOST=${PGHOST}")
  fi
  [[ -n "${PGPORT:-}" ]] && HOST_ARGS+=("-p" "${PGPORT}")
  [[ -n "${PGPORT:-}" ]] && PSQL_ENV+=("PGPORT=${PGPORT}")

  if [[ -n "$SUDO" ]] && env "${PSQL_ENV[@]}" $SUDO -u postgres psql "${PSQL_FLAGS[@]}" -tAc "SELECT 1" >/dev/null 2>&1; then
    PSQL_CMD=("$SUDO" "-u" "postgres" "env" "${PSQL_ENV[@]}" "psql" "${PSQL_FLAGS[@]}" "${HOST_ARGS[@]}")
  elif env "${PSQL_ENV[@]}" psql "${PSQL_FLAGS[@]}" -tAc "SELECT 1" >/dev/null 2>&1; then
    PSQL_CMD=("env" "${PSQL_ENV[@]}" "psql" "${PSQL_FLAGS[@]}" "${HOST_ARGS[@]}")
  elif env "${PSQL_ENV[@]}" psql "${PSQL_FLAGS[@]}" -U postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    PSQL_CMD=("env" "${PSQL_ENV[@]}" "psql" "${PSQL_FLAGS[@]}" -U "postgres" "${HOST_ARGS[@]}")
  elif command -v su >/dev/null 2>&1 && su - postgres -c "psql -w -tAc 'SELECT 1'" >/dev/null 2>&1; then
    PSQL_CMD=("su" "-" "postgres" "-c" "env ${PSQL_ENV[*]} psql ${PSQL_FLAGS[*]} ${HOST_ARGS[*]}")
  else
    return 1
  fi

  printf '%s\0' "${PSQL_CMD[@]}"
}

configure_database() {
  command -v psql >/dev/null 2>&1 || fail "psql no está disponible; revisa la instalación de PostgreSQL."
  info "Configurando base de datos y usuario (${PGDATABASE}/${PGUSER})..."

  local PSQL_CMD_RAW
  PSQL_CMD_RAW=$(build_psql_cmd | tr '\0' '\n' | paste -sd' ' - || true)
  if [[ -z "$PSQL_CMD_RAW" ]]; then
    warn "No se pudo conectar a PostgreSQL; intentando relajar pg_hba.conf temporalmente."
    relax_hba_auth || true
    PSQL_CMD_RAW=$(build_psql_cmd | tr '\0' '\n' | paste -sd' ' - || true)
    if [[ -z "$PSQL_CMD_RAW" ]]; then
      restore_hba_auth
      fail "No se pudo ejecutar psql (ni como postgres ni con PGUSER=${PGUSER:-<vacío>}). Revisa pg_hba.conf."
    fi
  fi

  local PSQL_CMD=( $PSQL_CMD_RAW )

  local esc_pwd
  esc_pwd="$(escape_sql "$PGPASSWORD")"

  local role_exists
  role_exists=$("${PSQL_CMD[@]}" -tAc "SELECT 1 FROM pg_roles WHERE rolname='${PGUSER}'" 2>/dev/null || true)
  if [[ "$role_exists" != "1" ]]; then
    info "Creando rol ${PGUSER}"
    "${PSQL_CMD[@]}" -c "CREATE ROLE \"${PGUSER}\" LOGIN PASSWORD '${esc_pwd}'"
  else
    info "Actualizando contraseña de rol ${PGUSER}"
    "${PSQL_CMD[@]}" -c "ALTER ROLE \"${PGUSER}\" WITH LOGIN PASSWORD '${esc_pwd}'"
  fi

  local db_exists
  db_exists=$("${PSQL_CMD[@]}" -tAc "SELECT 1 FROM pg_database WHERE datname='${PGDATABASE}'" 2>/dev/null || true)
  if [[ "$db_exists" != "1" ]]; then
    info "Creando base de datos ${PGDATABASE}"
    "${PSQL_CMD[@]}" -c "CREATE DATABASE \"${PGDATABASE}\" OWNER \"${PGUSER}\""
  else
    info "Base de datos ${PGDATABASE} ya existe; se asegura el ownership."
    "${PSQL_CMD[@]}" -c "ALTER DATABASE \"${PGDATABASE}\" OWNER TO \"${PGUSER}\""
  fi

  restore_hba_auth
}

ensure_env_files() {
  if [[ ! -f "$BACKEND_DIR/.env" ]]; then
    info "Generando $BACKEND_DIR/.env"
    cat >"$BACKEND_DIR/.env" <<EOF
PORT=3001
API_BASE=/api/v1
FRONT_ORIGIN=http://localhost:3000
PGHOST=${PGHOST}
PGPORT=${PGPORT}
PGDATABASE=${PGDATABASE}
PGUSER=${PGUSER}
PGPASSWORD=${PGPASSWORD}
JWT_SECRET=${JWT_SECRET:-cambia-esta-clave}
JWT_EXPIRES=${JWT_EXPIRES:-2h}
DB_ALTER=${DB_ALTER:-false}
SMTP_HOST=${SMTP_HOST:-ethereal}
MAIL_FROM="${MAIL_FROM:-Portal Fractura <no-reply@fracturas.local>}"
EMAIL_VERIFICATION_REQUIRED=${EMAIL_VERIFICATION_REQUIRED:-false}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_RUT=${ADMIN_RUT}
SEED_PASSWORD=${SEED_PASSWORD:-Clave123}
EOF
  else
    info "Backend .env ya existe, se respeta."
  fi

  if [[ ! -f "$FRONTEND_DIR/.env.local" ]]; then
    info "Generando $FRONTEND_DIR/.env.local"
    cat >"$FRONTEND_DIR/.env.local" <<EOF
NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE:-http://localhost:3001/api/v1}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
NEXT_PUBLIC_DEFAULT_PWD_PREFIX=${NEXT_PUBLIC_DEFAULT_PWD_PREFIX:-ABCD}
EOF
  else
    info "Frontend .env.local ya existe, se respeta."
  fi
}

install_dependencies() {
  ensure_bun

  install_with_bun() {
    local dir="$1" label="$2"
    info "Instalando dependencias del ${label} con bun..."
    (cd "$dir" && bun install) || fail "No se pudo instalar dependencias en ${label} con bun"
  }

  install_with_bun "$BACKEND_DIR" "backend"
  install_with_bun "$FRONTEND_DIR" "frontend"
}

check_structure() {
  [[ -d "$BACKEND_DIR" ]] || fail "No se encontró el backend en $BACKEND_DIR"
  [[ -d "$FRONTEND_DIR" ]] || fail "No se encontró el frontend en $FRONTEND_DIR"
}

main() {
  check_structure
  ensure_node
  ensure_bun
  ensure_postgres
  configure_database
  ensure_env_files
  install_dependencies

  cat <<EOF

Listo.
- Node: $(command -v node >/dev/null 2>&1 && node -v || echo "no instalado")
- PostgreSQL: $(command -v psql >/dev/null 2>&1 && psql --version || echo "no instalado")
- Backend .env: $BACKEND_DIR/.env
- Frontend .env.local: $FRONTEND_DIR/.env.local

Para levantar:
  cd "$BACKEND_DIR" && bun run dev
  cd "$FRONTEND_DIR" && bun run dev
EOF
}

main "$@"
