# Catálogo Digital

Aplicación web en TypeScript que consulta productos de Fake Store API y permite buscarlos, filtrarlos por categoría y ordenar el catálogo. Incluye un botón interactivo de favoritos por producto.

## Requisitos

- Node.js 20.19 o superior
- npm y Git

## Instalación y uso

```bash
npm install
npm run dev
```

Abre en el navegador la URL local que muestra Vite.

## Verificación

```bash
npm run lint
npm run typecheck
npm run build
```

Al instalar dependencias se activa Husky. El hook `pre-commit` ejecuta ESLint y TypeScript antes de permitir un commit. Para comprobar el bloqueo, introduce un error de lint, intenta hacer commit y confirma que el hook falla; corrige el error y vuelve a intentarlo.

## API

Los productos se consultan desde `https://fakestoreapi.com/products`. La aplicación muestra estados de carga, error con reintento y resultados vacíos.