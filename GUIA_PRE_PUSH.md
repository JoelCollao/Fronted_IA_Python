# Guía: Comandos Pre-Push y Validación de Código

## Resumen de Configuración

Este proyecto está configurado con **validación automática** de código mediante:

- **Prettier**: Formateo automático de código
- **ESLint**: Análisis estático y detección de errores
- **Husky**: Git hooks automáticos
- **lint-staged**: Ejecución eficiente solo en archivos modificados

---

## Validación Automática (Git Hooks)

### Al hacer `git commit`:

Los siguientes procesos se ejecutan **automáticamente**:

1.  Prettier formatea los archivos en staging
2.  ESLint revisa y corrige errores automáticamente
3.  Si hay errores que no se pueden corregir automáticamente, el commit se **aborta**

### Al hacer `git push`:

Se ejecutan **automáticamente** estas validaciones:

1.  ESLint completo en todo el proyecto (modo estricto, 0 warnings)
2.  Ejecución de todos los tests con Jest
3.  Si falla lint o tests, el push se **aborta**

---

## Comandos Manuales (Antes de Push)

Si quieres ejecutar las validaciones **manualmente antes de hacer commit/push**, usa estos comandos:

### 1 Formatear código con Prettier

```bash
# Formatear todos los archivos en src/
npm run format

# Solo verificar formato sin modificar archivos
npm run format:check
```

### 2 Ejecutar ESLint

```bash
# Lint con auto-fix (corrige automáticamente lo que puede)
npm run lint:fix

# Lint modo desarrollo (muestra warnings pero no falla)
npm run lint:dev

# Lint modo estricto (0 warnings - igual que pre-push)
npm run lint:strict
```

### 3 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests con reporte de cobertura
npm run test:coverage
```

### 4 Validación Completa (Simular Pre-Push)

```bash
# Ejecutar EXACTAMENTE lo mismo que se ejecuta en pre-push
npm run lint:strict && npm run test
```

---

## Flujo de Trabajo Recomendado

### Opción 1: Dejar que los hooks hagan todo (Recomendado)

```bash
# 1. Hacer cambios en el código
# 2. Agregar archivos
git add .

# 3. Commit (se ejecuta auto-formato y lint automáticamente)
git commit -m "feat: nueva funcionalidad"

# 4. Push (se ejecuta validación completa automáticamente)
git push origin mi-rama
```

### Opción 2: Validar manualmente antes de commit

```bash
# 1. Hacer cambios en el código

# 2. Formatear y lint manualmente
npm run format
npm run lint:fix

# 3. Ejecutar tests
npm run test

# 4. Si todo está OK, commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin mi-rama
```

### Opción 3: Validación completa manual (más seguro)

```bash
# 1. Hacer cambios en el código

# 2. Ejecutar validación completa antes de commit
npm run format
npm run lint:strict
npm run test

# 3. Si todo pasa, hacer commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin mi-rama
```

---

## Qué Hacer Si Falla la Validación

### Si falla Prettier (formato):

```bash
# Opción 1: Auto-formatear todo
npm run format

# Opción 2: Ver qué archivos tienen problemas
npm run format:check
```

### Si falla ESLint:

```bash
# Opción 1: Auto-fix (corrige la mayoría de problemas)
npm run lint:fix

# Opción 2: Ver errores específicos
npm run lint

# Revisar manualmente los archivos con errores que no se pueden auto-corregir
```

### Si fallan los Tests:

```bash
# Ver qué tests están fallando
npm run test

# Ejecutar tests en modo watch para debugging
npm run test:watch

# Ver cobertura y archivos sin testear
npm run test:coverage
```

---

## Configuración de Archivos

### Archivos creados/modificados:

- `.prettierrc` - Configuración de Prettier
- `.prettierignore` - Archivos que Prettier debe ignorar
- `.eslintrc.json` - Configuración de ESLint (actualizada con Prettier)
- `.lintstagedrc.json` - Configuración de lint-staged
- `.husky/pre-commit` - Hook de pre-commit
- `.husky/pre-push` - Hook de pre-push
- `package.json` - Scripts actualizados

---

## Comandos Rápidos de Referencia

| Comando                | Descripción                  |
| ---------------------- | ---------------------------- |
| `npm run format`       | Formatea todo el código      |
| `npm run format:check` | Verifica formato sin cambiar |
| `npm run lint:fix`     | Lint con auto-corrección     |
| `npm run lint:strict`  | Lint estricto (0 warnings)   |
| `npm run test`         | Ejecuta todos los tests      |
| `npm run pre-push`     | Simula validación pre-push   |

---

## Tips

1. **Instala extensiones de VS Code**:
   - ESLint (dbaeumer.vscode-eslint)
   - Prettier (esbenp.prettier-vscode)

2. **Configura format on save en VS Code** (`.vscode/settings.json`):

   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

3. **Si necesitas hacer commit sin validación** (emergencia):
   ```bash
   git commit --no-verify -m "fix: emergencia"
   git push --no-verify
   ```
   **NO recomendado** - úsalo solo en casos críticos

---

## Notas Importantes

- Los hooks se ejecutan **automáticamente** en cada commit/push
- Si el hook falla, el commit/push se **cancela**
- Puedes ejecutar los comandos manualmente cuando quieras
- La validación pre-push asegura que **solo código limpio** llegue al repositorio

---

**Fecha de configuración**: 6 de marzo de 2026
**Versión**: 1.0.0
