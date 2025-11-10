# 🚨 CORREÇÕES URGENTES - DEPLOY VPS

## ⚠️ 2 Erros Corrigidos

### ❌ Erro 1: Build Failed
```
ERESOLVE could not resolve
date-fns@4.1.0 conflicting with react-day-picker@8.10.1
```

### ❌ Erro 2: Runtime Failed (PM2)
```
ReferenceError: module is not defined in ES module scope
ecosystem.config.js incompatível com "type": "module"
```

---

## ✅ SOLUÇÃO RÁPIDA - 3 Passos no GitHub

### 📝 Passo 1: Editar `package.json`

🔗 https://github.com/VitorRandrade/monetary-mind-71177/edit/main/package.json

**Mudança A (linha ~56):**
```diff
- "date-fns": "^4.1.0",
+ "date-fns": "^3.6.0",
```

**Mudança B (linha ~16):**
```diff
- "start:prod": "NODE_ENV=production pm2 start ecosystem.config.js",
+ "start:prod": "NODE_ENV=production pm2 start ecosystem.config.cjs",
```

✅ Commit changes

---

### 📝 Passo 2: Renomear arquivo

🔗 https://github.com/VitorRandrade/monetary-mind-71177/blob/main/ecosystem.config.js

1. Clique nos **3 pontos (...)** no canto superior direito
2. Selecione **"Rename file"**
3. Mude: `ecosystem.config.js` → `ecosystem.config.cjs`

✅ Commit changes

---

### 📝 Passo 3: Editar `Dockerfile`

🔗 https://github.com/VitorRandrade/monetary-mind-71177/edit/main/Dockerfile

**Mudança A (linha ~38):**
```diff
- COPY ecosystem.config.js ./
+ COPY ecosystem.config.cjs ./
```

**Mudança B (linha ~51):**
```diff
- CMD ["pm2-runtime", "start", "ecosystem.config.js"]
+ CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
```

✅ Commit changes

---

## 🚀 Fazer Deploy

Após aplicar as 3 correções acima:

1. Vá no **Easypanel**
2. Clique em **Deploy/Rebuild**
3. ✅ Build deve completar sem erros!

---

## 📊 Checklist

- [ ] `package.json` editado (2 mudanças)
- [ ] `ecosystem.config.js` renomeado para `.cjs`
- [ ] `Dockerfile` editado (2 mudanças)
- [ ] Deploy no Easypanel iniciado
- [ ] ✅ Aplicação funcionando!

---

## 🆘 Se continuar com erro

Verifique nos logs do Easypanel:
- ✅ Build deve mostrar: "Dependencies installed successfully"
- ✅ Runtime deve mostrar: "PM2 log: App launched"
- ❌ Se aparecer "module is not defined" → refaça o Passo 2 e 3
- ❌ Se aparecer "ERESOLVE" → refaça o Passo 1
