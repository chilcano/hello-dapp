# Estrategia para Web3 Monitoring

Cómo monitorizar wallets y smart contracts (Web3)

---

## 🟢 Paso 1: Define qué es “crítico”

Antes de usar herramientas, identifica **qué no puede fallar**.

### Wallets críticas
- Owner
- Deployer
- Treasury
- Multi-sig
- Pauser / Admin

### Smart contracts críticos
- Contratos con fondos
- Contratos con permisos administrativos
- Contratos upgradeables
- Contratos con funciones sensibles (`pause`, `mint`, `burn`, `upgrade`)

> Si algo no es crítico, **no lo monitorices aún**.

---

## 🟢 Paso 2: Monitorización de wallets

### Qué vigilar
- Cualquier transacción **saliente**
- Cambios de nonce inesperados
- Uso de la wallet fuera de horarios normales
- Interacciones con contratos desconocidos

### Señales de alerta típicas
- Wallet admin ejecuta transacciones a horas inusuales
- Wallet treasury mueve grandes cantidades de golpe
- Wallet nunca usada empieza a firmar transacciones

### Regla simple de ejemplo

> SI wallet_admin envía una transacción
> → alerta inmediata

---

## 🟢 Paso 3: Monitorización de smart contracts

### Qué vigilar (mínimo)
- Eventos críticos:
  - `Transfer`
  - `Approval`
  - `Paused / Unpaused`
  - Cambios de owner o roles
- Funciones sensibles:
  - `pause()`
  - `upgrade()`
  - `setOwner()`
  - `mint()`

### Qué NO vigilar
- Eventos irrelevantes
- Funciones internas
- Llamadas `view` o `pure`

---

## 🟢 Paso 4: Monitorizar estado, no solo eventos

Algunos ataques **no emiten eventos claros**.

### Ejemplos de checks de estado
- Balance del contrato cae bruscamente
- Supply total aumenta de forma anómala
- Cambio inesperado de owner
- Cambio de estado en contratos pausables

### Regla de ejemplo

> SI balance_contrato < umbral_definido
> → alerta crítica

---

## 🟢 Paso 5: Correlación básica de eventos

Una alerta aislada puede ser normal.
Varias juntas suelen indicar incidente.

### Ejemplo de correlación
- Wallet admin ejecuta `pause()`
- Pocos bloques después, la treasury transfiere fondos

> Alta probabilidad de incidente real.

---

## 🟢 Paso 6: Alertas bien diseñadas

Una buena alerta debe responder:
- ¿Qué pasó?
- ¿En qué wallet o contrato?
- ¿Impacto económico?
- ¿Acción recomendada?

### Ejemplo malo
> “Transfer detected”

### Ejemplo bueno
> “Treasury wallet envió 2.3M tokens a una dirección desconocida”

---

## 🟢 Paso 7: Playbooks mínimos

Cada alerta crítica debe tener definido:
- Acción inmediata (pause, revoke, freeze)
- Responsable
- Decisión clara y rápida

> No improvisar durante un incidente.

---

## 🧠 Resumen final

- Monitorizar ≠ observar  
- Monitorizar = **alertar y reaccionar**
- Empieza por wallets y contratos críticos
- Prioriza estado sobre ruido
- Alertas accionables
- Playbooks antes del incidente
