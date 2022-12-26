# Ali Próximo

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Estrutura de Pastas

```text
.github
  └─ workflows
        └─ CI com configurações de cache pnpm
.vscode
  └─ Recomendações de extensões e configurações para usuários de VSCode
apps
  ├─ expo
  |   ├─ Expo SDK 46
  |   ├─ React Native com React 18
  |   ├─ Tailwind com Nativewind
  |   └─ Chamadas API com segurança de tipos usando tRPC
  └─ next.js
      ├─ Next.js 13
      ├─ React 18
      ├─ TailwindCSS
      └─ E2E API com segurança de tipos no Servidor & Cliente
packages
 ├─ api
 |   └─ tRPC v10 definição dos roteadores
 ├─ auth
     └─ autenticação usando next-auth. **NOTE: Somente no app Next.js, Expo não**
 └─ db
     └─ Chamadas ao banco de dados com segurança de tipos usando Prisma
```

## Como iniciar?

```diff
git clone https://github.com/AliProximo/aliproximo.git
cd aliproximo
# Instalar dependências
pnpm i

# Em `packages/db/prisma/schema.prisma`, atualizar a configuração `provider` para `mysql` ou utilize seu próprio provedor de banco de dados
generator client {
     provider = "prisma-client-js"
+    previewFeatures = ["referentialIntegrity"]
}

datasource db {
-    provider = "postgresql"
+    provider = "mysql"
     url      = env("DATABASE_URL")
+    relationMode = "prisma"
}

# (opcional) MySQL Local com Docker Compose
docker-compose up -d

# Configurar variáveis de ambiente.
# Existe um arquivo `.env.example` no diretório raiz que pode ser usado como referências
cp .env.example .env

# Envie o schema Prisma para seu banco de dados
pnpm db:push
```

### Configurar Expo `dev`-script

> **Nota:** Se você quiser usar um dispositivo físico com Expo Go, é preciso rodar `dev` sem `turbo` (ex.: `pnpm --filter expo dev`). Porque a saída de terminal do turbo não é interativa.

#### Usando Simulador iOS

1. Verifique que tenha o XCode e XCommand Line Tools instalados [como visto na documentação do expo](https://docs.expo.dev/workflow/ios-simulator/).
2. Modifique o script `dev` em `apps/expo/package.json` para abrir o simulador iOS. (Esse é o padrão)

```diff
+  "dev": "expo start --ios",
```

3. Rodar `pnpm dev` na pasta raiz do projeto.

#### Usando Android

1. Instale o Android Studio [como visto na documentação do expo](https://docs.expo.dev/workflow/android-studio-emulator/).
2. Modifique o script `dev` em `apps/expo/package.json` para abrir o emulador Android.

```diff
+  "dev": "expo start --android",
```

3. Rodar `pnpm dev` na pasta raiz do projeto.

### Problemas Comuns

- Caso a lista de gitmojis esteja desatualizada, tente usar `scripts/fetch-gitmojis`: script node para buscar a lista de gitmojis de gitmoji.dev no github.

- Falha no carregamento das variáveis de ambiente, tente criar um link simbólico com o arquivo `.env` do diretório raiz

```shell
> next build

❌ Invalid environment variables
...
> ln -s `pwd`/.env apps/nextjs/.env
> next build

info  - Loaded env from `pwd`/apps/nextjs/.env
```

- Se o IntelliSense do VSCode ficar em loop infinito ao carregar, 2 possíveis responsáveis: checar se a versão do typescript usada pelo VSCode é a mesma do workspace e se o computador estiver em economia de bateria.

### Variáveis de Ambiente

#### Next.js

- `DATABASE_URL`: url para conectar ao banco de dados com Prisma.
- `NEXTAUTH_URL`: url para o site, next-auth utiliza `VERCEL_URL` caso a primeira alternativa seja nula.
- `NEXTAUTH_SECRET`: Sugerido utilizar [@sandrinodimattia/generate-secret](https://github.com/sandrinodimattia/generate-secret) para gerar um valor aleatório. Leia mais na documentação do [NextAuth](https://next-auth.js.org/configuration/options#secret).
- `GOOGLE_CLIENT_{ID,SECRET}`: Informações do cliente OAuth 2.0, recuperadas através do site <https://console.developers.google.com/apis/credentials>.
- `ADMIN_EMAIL`: email do usuário padrão do sistema.
- `S3_{REGION,ACCESS_KEY_ID,SECRET_ACCESS_KEY,BUCKET_NAME}`: configurações para instanciação do cliente AWS IAM e S3. Leia mais na documentação oficial da AWS e no [post](https://betterprogramming.pub/how-to-upload-files-to-amazon-s3-from-nextjs-app-b7ef1909976b).

## Licença

Esse projeto foi licenciado pela Apache License 2.0 - ver [LICENSE](LICENSE) para mais detalhes

## Ambiente de Produção

- ProtonMail e-mail
- MySql DB PlanetScale
- AWS S3 Bucket
- Vercel Team Deploy
- Google App on <contato@tmtecnologia.dev.br>
