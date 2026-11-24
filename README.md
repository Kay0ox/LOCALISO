# Sistema de Locação de Veículos

Sistema web para cadastro de usuários, gerenciamento de veículos e registro de locações, com API REST em Node.js e interface em React.

**Autor:** Kayo Victor — Ciência da Computação, 6º período

## Tecnologias

**Backend (`localiso/`)**
- Node.js + Express 5
- Prisma ORM 7 + MySQL 8
- Autenticação com JWT (jsonwebtoken)
- Hash de senhas com bcrypt

**Frontend (`localiso-front/`)**
- React + Vite
- Consumo da API com `fetch`

## Estrutura do projeto

```
LOCALISO/
├── localiso/
│   ├── prisma/
│   │   ├── schema.prisma        # modelos e relacionamentos
│   │   └── migrations/          # histórico das tabelas
│   ├── prisma.config.js
│   └── src/
│       ├── server.js            # inicia o servidor
│       ├── app.js               # configura o Express
│       ├── config/prisma.js     # conexão única com o banco
│       ├── errors/AppError.js   # erro com código HTTP
│       ├── middlewares/         # autenticação JWT e tratamento de erros
│       ├── utils/               # validações e cálculo de diárias
│       ├── routes/              # mapeamento dos endpoints
│       ├── controllers/         # entrada e resposta HTTP
│       └── services/            # validações e regras de negócio
└── localiso-front/
    └── src/
        ├── api.js               # chamadas à API com token
        ├── formatar.js          # formatação de moeda e datas
        ├── App.jsx              # usuário logado e navegação
        ├── components/Mensagem.jsx
        └── pages/               # AuthPage, VeiculosPage, LocacoesPage
```

## Como executar

### Pré-requisitos
- Node.js 20.19 ou superior
- Docker Desktop (ou MySQL 8 instalado)

### 1. Subir o MySQL

```bash
docker run --name locadora-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=locadora -p 3308:3306 -d mysql:8.4
```

Nas próximas vezes: `docker start locadora-mysql`.

### 2. Configurar e rodar a API

```bash
cd localiso
npm install
```

Copie o arquivo `.env.example` para `.env` e ajuste os valores. Para gerar o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Crie as tabelas e gere o Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

Inicie a API (porta 3000):

```bash
npm run dev
```

### 3. Rodar o frontend

Em outro terminal:

```bash
cd localiso-front
npm install
npm run dev
```

Acesse **http://localhost:5173**.

## Endpoints da API

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/registrar` | Não | Cadastra usuário |
| POST | `/auth/login` | Não | Retorna o token JWT |
| GET | `/auth/me` | Sim | Dados do usuário logado |
| POST | `/veiculos` | Sim | Cadastra veículo |
| GET | `/veiculos` | Sim | Lista veículos (`?disponiveis=true` filtra) |
| GET | `/veiculos/:id` | Sim | Busca um veículo |
| POST | `/locacoes` | Sim | Registra locação |
| GET | `/locacoes` | Sim | Lista as locações do usuário (`?status=ATIVA` ou `FINALIZADA`) |
| GET | `/locacoes/:id` | Sim | Detalhe de uma locação do usuário |
| PATCH | `/locacoes/:id/finalizar` | Sim | Registra a devolução |

Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

### Códigos de resposta

| Código | Situação |
| --- | --- |
| 200 / 201 | Sucesso / recurso criado |
| 400 | Dados inválidos (ex.: datas invertidas, diária negativa) |
| 401 | Token ausente, inválido ou expirado; login incorreto |
| 403 | Tentativa de acessar locação de outro usuário |
| 404 | Veículo, locação ou rota inexistente |
| 409 | E-mail ou placa duplicados; veículo indisponível; locação já finalizada |

## Regras de negócio

- Somente usuários autenticados gerenciam veículos e locações.
- Um veículo não pode ter mais de uma locação ativa ao mesmo tempo.
- Uma locação é ativa enquanto não houver devolução registrada; a devolução encerra a locação e libera o veículo.
- Não é possível finalizar uma locação já finalizada.
- A data prevista de devolução deve ser posterior à data de início.
- O valor total é calculado no backend: qualquer fração de 24 horas conta como diária completa.
- Cada usuário só consulta e finaliza as próprias locações; o usuário é identificado pelo token, nunca por um campo enviado pelo cliente.
- E-mails e placas não podem ser duplicados.
- O histórico é preservado: não há exclusão de veículos nem de locações.

## Decisões de implementação

**Separação em camadas.** Routes apenas mapeiam os endpoints, controllers tratam a entrada e a resposta HTTP, e services concentram validações e regras de negócio. Os services lançam `AppError` com o código HTTP adequado, e um middleware global converte os erros em respostas JSON no formato `{ "erro": "mensagem" }`.

**Disponibilidade do veículo.** O veículo possui o campo `disponivel`. Ele é alterado somente dentro das mesmas transações que criam ou finalizam locações, mantendo os dados sempre consistentes.

**Concorrência.** A reserva usa `prisma.$transaction` com um `updateMany` condicional (`WHERE id = ? AND disponivel = true`). O MySQL trava a linha do veículo durante o UPDATE. Em duas requisições simultâneas, a segunda encontra o veículo já indisponível (`count = 0`) e recebe 409, sem criar uma segunda locação. A finalização segue a mesma lógica, filtrando por `status = ATIVA`.

**Cálculo do valor.** `diárias = Math.ceil((devolução prevista − início) / 24h)` e `valor total = diárias × valor da diária`. Valores monetários usam o tipo `Decimal(10,2)` para evitar erros de ponto flutuante.

**Segurança.** As senhas são armazenadas com `bcrypt` (custo 10, salt aleatório) e o hash nunca é retornado pela API. O JWT é assinado com HS256, expira em 1 hora e carrega o id do usuário no campo `sub`. O login responde com a mesma mensagem para e-mail inexistente e senha incorreta, para não revelar quais e-mails estão cadastrados.

**Unicidade.** E-mail e placa têm verificação no service e índice `@unique` no banco, que garante a regra mesmo em requisições simultâneas.

**Relacionamentos.** `Usuario` 1:N `Locacao` e `Veiculo` 1:N `Locacao`, com chaves estrangeiras `usuarioId` e `veiculoId`. O `onDelete: Restrict` impede apagar registros que tenham histórico de locações.

**Frontend.** Formulários controlados com `useState`. Após cada operação, a interface recarrega os dados da API. As mensagens de erro exibidas são as retornadas pelo backend. O token fica no `localStorage` e é enviado em todas as requisições; se ele expirar (401), o usuário é deslogado.
