# 🔧 Correção do Erro de Build Docker

## Problema
Erro ao fazer build do Docker devido a conflito de dependências entre `date-fns@4.1.0` e `react-day-picker@8.10.1`.

## Solução Aplicada
Downgrade do `date-fns` de v4.1.0 para v3.6.0 (compatível com react-day-picker).

## Arquivos Alterados

### 1. `package.json`
```json
"date-fns": "^3.6.0"  // era "^4.1.0"
```

## Como Aplicar a Correção no Servidor

### Opção 1: Editar diretamente no GitHub (MAIS FÁCIL)

1. Acesse: https://github.com/VitorRandrade/monetary-mind-71177/edit/main/package.json

2. Localize a linha 56 (aproximadamente):
```json
"date-fns": "^4.1.0",
```

3. Altere para:
```json
"date-fns": "^3.6.0",
```

4. Clique em "Commit changes"

5. No seu painel Easypanel, faça um novo deploy

### Opção 2: Via SSH no Servidor

Se você tem acesso SSH à VPS:

```bash
# Conectar ao servidor
ssh seu-usuario@seu-servidor

# Ir para o diretório do projeto
cd /etc/easypanel/projects/docker/financeiro_unified/code/

# Editar o package.json
nano package.json

# Localizar a linha com "date-fns": "^4.1.0"
# Alterar para "date-fns": "^3.6.0"
# Salvar (Ctrl+O, Enter, Ctrl+X)

# Fazer rebuild do container no Easypanel
```

### Opção 3: Recriar o serviço no Easypanel

1. No Easypanel, vá no seu serviço
2. Clique em "Settings" → "Source"
3. Mude o commit/branch temporariamente e salve
4. Volte para a branch `main` 
5. Isso forçará um novo pull do código
6. Faça deploy novamente

## Verificação

Após aplicar a correção, o build deve completar sem erros. Você verá algo como:

```
✓ Dependencies installed successfully
✓ Build completed
✓ Container started
```

## Commits Locais (Para Referência)

Commits feitos localmente mas não enviados ao GitHub por falta de permissão:

- `535d372` - fix: adicionar --legacy-peer-deps no Dockerfile
- `519265e` - fix: downgrade date-fns para v3.6.0 para compatibilidade

## Precisa de Ajuda?

Se tiver problemas, pode:
1. Verificar os logs no Easypanel
2. Testar localmente com: `docker build -t test .`
3. Verificar se o package.json foi atualizado corretamente
