# Seguridad Vecinal Demo

Demo frontend de un sistema de seguridad vecinal para administrar accesos, usuarios, avisos y datos operativos desde una aplicacion React.

## Tecnologias

- React
- Vite
- Tailwind CSS
- React Router
- localStorage
- Netlify

## Modo Demo

Esta version esta preparada para funcionar sin backend, sin base de datos y sin Firebase. Los datos iniciales se cargan desde archivos locales dentro de `src/data/` y los cambios realizados durante la prueba se guardan temporalmente en `localStorage`.

Al limpiar el almacenamiento del navegador o restaurar la demo, los datos pueden volver a su estado inicial.

## Funcionalidades Implementadas

- Login demo local.
- Roles simulados: Administrador, Residente y Seguridad.
- Usuarios con persistencia en `localStorage`.
- Catalogos y estados demo compartidos.
- Avisos con datos precargados y persistencia en `localStorage`.

## Credenciales Demo

| Usuario | Contrasena | Rol |
| --- | --- | --- |
| Administrador | Administrador | Administrador |
| Yael | 123456 | Residente |
| invitado | invitado1 | Seguridad |

## Comandos

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Generar build de produccion:

```bash
npm run build
```

Previsualizar build:

```bash
npm run preview
```

## Netlify

Configuracion recomendada:

- Build command: `npm run build`
- Publish directory: `dist`

El archivo `netlify.toml` incluye una redireccion SPA para que rutas internas como `/admin/avisos` funcionen al recargar la pagina.

## Estado Del Proyecto

Demo en desarrollo por etapas. Actualmente estan listas las etapas de login local, usuarios locales, catalogos compartidos y avisos con localStorage.
