"use client";

import * as React from "react";
import { Camera, Save, Shield, Bell, UserCog, Globe, Moon, LogOut } from "lucide-react";

/* =======================
   Mini UI (sin shadcn/ui)
   ======================= */

function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("bg-white rounded-lg border border-gray-200 shadow-sm", className)}>{children}</div>;
}
function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("p-6 pb-4", className)}>{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}
function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}
function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("px-6 pb-6", className)}>{children}</div>;
}

type ButtonVariant = "default" | "secondary" | "destructive" | "ghost";
function Button({
  children,
  className = "",
  onClick,
  type = "button",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
}) {
  const variants: Record<ButtonVariant, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={cx(
        "w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, rows = 4, ...rest } = props;
  return (
    <textarea
      rows={rows}
      {...rest}
      className={cx(
        "w-full px-3 py-2 border border-gray-300 rounded-md text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "resize-y",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}
function Label({ htmlFor, children, className = "" }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cx("text-sm font-medium text-gray-700", className)}>
      {children}
    </label>
  );
}
function Separator() {
  return <div className="h-px w-full bg-gray-200" />;
}

/* Select nativo “bonito” */
function Select({
  value,
  onValueChange,
  children,
  disabled = false,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        disabled={disabled}
        className={cx(
          "w-full h-10 px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm bg-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        )}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        fill="currentColor"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.172l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06z" />
      </svg>
    </div>
  );
}
function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}

/* Switch mínimo */
function Switch({
  checked,
  onCheckedChange,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cx(
        "h-6 w-11 rounded-full border transition relative",
        checked ? "bg-blue-600 border-blue-600" : "bg-gray-200 border-gray-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

/* Tabs simples */
function Tabs({
  defaultValue,
  children,
  className = "",
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}
const TabsContext = React.createContext<{ value: string; setValue: (v: string) => void } | null>(null);

function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("inline-flex rounded-md bg-gray-100 p-1", className)}>{children}</div>;
}
function TabsTrigger({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cx(
        "px-3 py-2 text-sm rounded-md transition",
        active ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900",
        className
      )}
    >
      {children}
    </button>
  );
}
function TabsContent({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

/* =======================
   Vista: Perfil / Config
   ======================= */

type Profile = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rut?: string;
};

type Preferencias = {
  idioma: "es" | "en";
  zonaHoraria: string;
  tema: "sistema" | "claro" | "oscuro";
};

type Notifs = {
  correoGeneral: boolean; // único ajuste simple
};

export default function PerfilPage() {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [perfil, setPerfil] = React.useState<Profile>({
    nombre: "Sofía",
    apellido: "Gutiérrez",
    email: "sofia@example.com",
    telefono: "+56 9 1234 5678",
    rut: "12.345.678-9",
  });

  const [prefs, setPrefs] = React.useState<Preferencias>({
    idioma: "es",
    zonaHoraria: "America/Santiago",
    tema: "sistema",
  });

  // notificaciones simplificadas
  const [notifs, setNotifs] = React.useState<Notifs>({ correoGeneral: false });

  const [seg, setSeg] = React.useState({
    actual: "",
    nueva: "",
    confirmar: "",
    mfa: false,
  });

  function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    // solo enviaremos email (y opcionalmente teléfono si quieres)
    console.log("Guardar perfil (solo email):", { email: perfil.email });
    alert("Correo actualizado");
  }
  function handleSaveSeguridad(e: React.FormEvent) {
    e.preventDefault();
    if (seg.nueva !== seg.confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Actualizar seguridad:", seg);
    alert("Seguridad actualizada");
    setSeg((s) => ({ ...s, actual: "", nueva: "", confirmar: "" }));
  }
  function handleSavePreferencias(e: React.FormEvent) {
    e.preventDefault();
    console.log("Preferencias:", prefs);
    alert("Preferencias guardadas");
  }
  function handleSaveNotifs(e: React.FormEvent) {
    e.preventDefault();
    console.log("Notificaciones simples:", notifs);
    alert("Preferencia de correos actualizada");
  }
  function handleCerrarSesiones() {
    alert("Se cerraron sesiones en otros dispositivos");
  }
  function handleAvatarChange(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-slate-200">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="https://api.dicebear.com/9.x/initials/svg?seed=SG"
              alt="Avatar"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-gray-500">Gestiona tu información básica, seguridad y preferencias.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="avatar-upload">
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0])}
            />
            <Button variant="secondary" className="gap-2">
              <Camera className="h-4 w-4" /> Cambiar foto
            </Button>
          </label>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="perfil" className="gap-2">
            <UserCog className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="preferencias" className="gap-2">
            <Globe className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="notifs" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* PERFIL */}
        <TabsContent value="perfil" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>Solo puedes actualizar tu correo electrónico.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePerfil} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={perfil.nombre} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={perfil.apellido} disabled />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                    placeholder="correo@dominio.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" value={perfil.rut ?? ""} disabled />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> Guardar correo
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURIDAD */}
        <TabsContent value="seguridad" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña periódicamente.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSeguridad} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pass-actual">Contraseña actual</Label>
                    <Input id="pass-actual" type="password" value={seg.actual} onChange={(e) => setSeg({ ...seg, actual: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pass-nueva">Nueva contraseña</Label>
                    <Input id="pass-nueva" type="password" value={seg.nueva} onChange={(e) => setSeg({ ...seg, nueva: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pass-confirmar">Confirmar nueva contraseña</Label>
                    <Input id="pass-confirmar" type="password" value={seg.confirmar} onChange={(e) => setSeg({ ...seg, confirmar: e.target.value })} />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> Actualizar contraseña
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Autenticación & sesiones</CardTitle>
                <CardDescription>Protege tu cuenta con MFA y controla accesos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticación en dos pasos (MFA)</p>
                    <p className="text-sm text-gray-500">Añade una capa extra con app de autenticación.</p>
                  </div>
                  <Switch checked={seg.mfa} onCheckedChange={(v) => setSeg((s) => ({ ...s, mfa: !!v }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cerrar sesiones en otros dispositivos</p>
                    <p className="text-sm text-gray-500">Si sospechas actividad inusual, cierra todo.</p>
                  </div>
                  <Button variant="secondary" onClick={handleCerrarSesiones} className="gap-2">
                    <LogOut className="h-4 w-4" /> Cerrar sesiones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PREFERENCIAS */}
        <TabsContent value="preferencias" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>Idioma, zona horaria y tema visual.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferencias} className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Idioma</Label>
                  <Select value={prefs.idioma} onValueChange={(v) => setPrefs({ ...prefs, idioma: v as "es" | "en" })}>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Zona horaria</Label>
                  <Select value={prefs.zonaHoraria} onValueChange={(v) => setPrefs({ ...prefs, zonaHoraria: v })}>
                    <SelectItem value="America/Santiago">America/Santiago</SelectItem>
                    <SelectItem value="America/Bogota">America/Bogota</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Tema</Label>
                  <Select value={prefs.tema} onValueChange={(v) => setPrefs({ ...prefs, tema: v as "sistema" | "claro" | "oscuro" })}>
                    <SelectItem value="sistema">Sistema</SelectItem>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="oscuro">Oscuro</SelectItem>
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> Guardar preferencias
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICACIONES (simple) */}
        <TabsContent value="notifs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Por ahora no hay notificaciones avanzadas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSaveNotifs} className="space-y-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <p className="font-medium leading-none">Correos administrativos</p>
                    <p className="text-sm text-gray-500 mt-1">Recibir actualizaciones generales de la plataforma.</p>
                  </div>
                  <Switch
                    checked={notifs.correoGeneral}
                    onCheckedChange={(v) => setNotifs({ correoGeneral: v })}
                  />
                </div>
                <div>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> Guardar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
