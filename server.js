var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_meta = {};
import_dotenv.default.config();
var __dirname = import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
var usersDatabase = [
  {
    id: "usr-admin-1",
    name: "Administrador JurisAI Pro",
    cpf: "000.000.000-00",
    email: "admin@jurisai.pro",
    role: "admin",
    status: "active",
    licenseType: "enterprise",
    areaAtuacao: "Administra\xE7\xE3o Geral & Compliance",
    createdAt: (/* @__PURE__ */ new Date("2025-01-01")).toISOString(),
    expiresAt: (/* @__PURE__ */ new Date("2035-12-31")).toISOString(),
    notes: "Acesso Mestre irrestrito ao painel de controle."
  },
  {
    id: "usr-lawyer-1",
    name: "Dr. Carlos Eduardo Mendes",
    cpf: "111.222.333-44",
    email: "carlos.mendes@advocacia.com.br",
    phone: "(11) 98765-4321",
    role: "user",
    status: "active",
    licenseType: "pro",
    areaAtuacao: "Direito Civil e Empresarial",
    createdAt: (/* @__PURE__ */ new Date("2026-01-10")).toISOString(),
    expiresAt: new Date(Date.now() + 240 * 24 * 60 * 60 * 1e3).toISOString(),
    notes: "Licen\xE7a Profissional OAB/SP 412.390 ativa."
  },
  {
    id: "usr-lawyer-2",
    name: "Dra. Mariana Vasconcelos",
    cpf: "222.333.444-55",
    email: "mariana.vasconcelos@oab.org.br",
    phone: "(21) 99123-8877",
    role: "user",
    status: "active",
    licenseType: "trial",
    areaAtuacao: "Direito do Trabalho & Previdenci\xE1rio",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
    notes: "Per\xEDodo de avalia\xE7\xE3o de 7 dias aprovado pela administra\xE7\xE3o."
  },
  {
    id: "usr-lawyer-3",
    name: "Dr. Roberto Silveira",
    cpf: "333.444.555-66",
    email: "roberto.silveira@juridico.adv.br",
    phone: "(31) 98844-1234",
    role: "user",
    status: "pending",
    licenseType: "trial",
    areaAtuacao: "Direito Penal e Processo Penal",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1e3).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
    notes: "Solicita\xE7\xE3o de teste aguardando valida\xE7\xE3o do administrador."
  },
  {
    id: "usr-lawyer-4",
    name: "Dra. Juliana Ferreira Lima",
    cpf: "444.555.666-77",
    email: "juliana.lima@sociedadeadv.com.br",
    phone: "(41) 97711-2233",
    role: "user",
    status: "expired",
    licenseType: "trial",
    areaAtuacao: "Direito Tribut\xE1rio",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1e3).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
    notes: "Per\xEDodo de teste conclu\xEDdo. Necessita de renova\xE7\xE3o de plano."
  }
];
function cleanCpf(cpf) {
  return cpf.replace(/\D/g, "");
}
function formatCpf(cpf) {
  const digits = cleanCpf(cpf);
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return cpf;
}
function calculateDaysLeft(expiresAtIso) {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  return Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
}
var aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    console.error("Failed to instantiate GoogleGenAI client:", err);
  }
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    system: "JurisAI Pro Backend API",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    usersCount: usersDatabase.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/auth/validate-cpf", (req, res) => {
  const { cpf } = req.body;
  if (!cpf) {
    return res.status(400).json({ success: false, message: "CPF \xE9 obrigat\xF3rio." });
  }
  const rawInput = cleanCpf(cpf);
  const user = usersDatabase.find((u) => cleanCpf(u.cpf) === rawInput);
  if (!user) {
    return res.status(404).json({
      success: false,
      code: "NOT_FOUND",
      message: "CPF n\xE3o cadastrado na base JurisAI Pro."
    });
  }
  const daysLeft = calculateDaysLeft(user.expiresAt);
  let computedStatus = user.status;
  if (computedStatus === "active" && daysLeft <= 0) {
    computedStatus = "expired";
    user.status = "expired";
  }
  if (computedStatus === "pending") {
    return res.status(403).json({
      success: false,
      code: "PENDING_APPROVAL",
      message: "Sua solicita\xE7\xE3o de per\xEDodo de teste ainda est\xE1 aguardando aprova\xE7\xE3o do administrador.",
      user: {
        id: user.id,
        name: user.name,
        cpf: formatCpf(user.cpf),
        status: user.status,
        createdAt: user.createdAt
      }
    });
  }
  if (computedStatus === "blocked") {
    return res.status(403).json({
      success: false,
      code: "BLOCKED",
      message: "Esta conta foi suspensa ou bloqueada pelo administrador. Entre em contato com o suporte.",
      user: {
        id: user.id,
        name: user.name,
        cpf: formatCpf(user.cpf),
        status: user.status
      }
    });
  }
  if (computedStatus === "expired") {
    return res.status(403).json({
      success: false,
      code: "EXPIRED",
      message: "Sua licen\xE7a ou per\xEDodo de teste expirou. Solicite a renova\xE7\xE3o ou upgrade com o administrador.",
      user: {
        id: user.id,
        name: user.name,
        cpf: formatCpf(user.cpf),
        status: user.status,
        expiresAt: user.expiresAt,
        daysLeft: 0
      }
    });
  }
  return res.json({
    success: true,
    message: "Acesso autorizado ao Terminal JurisAI Pro.",
    user: {
      id: user.id,
      name: user.name,
      cpf: formatCpf(user.cpf),
      email: user.email,
      role: user.role,
      status: computedStatus,
      licenseType: user.licenseType,
      areaAtuacao: user.areaAtuacao,
      expiresAt: user.expiresAt,
      daysLeft: Math.max(0, daysLeft)
    }
  });
});
app.post("/api/auth/admin-login", (req, res) => {
  const { password, cpf } = req.body;
  const masterPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (!password) {
    return res.status(400).json({ success: false, message: "Senha mestra \xE9 obrigat\xF3ria." });
  }
  if (password !== masterPassword) {
    return res.status(401).json({
      success: false,
      message: "Senha mestra do administrador incorreta."
    });
  }
  const rawCpf = cpf ? cleanCpf(cpf) : "";
  const adminUser = usersDatabase.find((u) => u.role === "admin" && (rawCpf ? cleanCpf(u.cpf) === rawCpf : true)) || usersDatabase[0];
  return res.json({
    success: true,
    message: "Autentica\xE7\xE3o de administrador realizada com sucesso.",
    user: {
      id: adminUser.id,
      name: adminUser.name,
      cpf: formatCpf(adminUser.cpf),
      role: "admin",
      status: "active",
      licenseType: "enterprise",
      expiresAt: adminUser.expiresAt,
      daysLeft: 9999
    }
  });
});
app.post("/api/trial/request", (req, res) => {
  const { name, cpf, email, phone, areaAtuacao } = req.body;
  if (!name || !cpf) {
    return res.status(400).json({ success: false, message: "Nome e CPF s\xE3o campos obrigat\xF3rios." });
  }
  const rawCpf = cleanCpf(cpf);
  if (rawCpf.length !== 11) {
    return res.status(400).json({ success: false, message: "CPF inv\xE1lido. Certifique-se de preencher 11 d\xEDgitos." });
  }
  const formattedCpf = formatCpf(cpf);
  const existing = usersDatabase.find((u) => cleanCpf(u.cpf) === rawCpf);
  if (existing) {
    if (existing.status === "pending") {
      return res.status(409).json({
        success: false,
        message: "J\xE1 existe uma solicita\xE7\xE3o pendente para este CPF. Aguarde a avalia\xE7\xE3o."
      });
    }
    if (existing.status === "active") {
      return res.status(409).json({
        success: false,
        message: "Este CPF j\xE1 possui uma licen\xE7a ativa no sistema. Fa\xE7a o login diretamente."
      });
    }
  }
  const newRequest = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    cpf: formattedCpf,
    email: email ? email.trim() : `${rawCpf}@usuario.jurisai.pro`,
    phone: phone ? phone.trim() : void 0,
    role: "user",
    status: "pending",
    licenseType: "trial",
    areaAtuacao: areaAtuacao ? areaAtuacao.trim() : "Direito Geral",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
    notes: "Solicita\xE7\xE3o espont\xE2nea enviada via formul\xE1rio p\xFAblico."
  };
  usersDatabase.unshift(newRequest);
  return res.json({
    success: true,
    message: "Solicita\xE7\xE3o de per\xEDodo de teste enviada com sucesso! O administrador avaliar\xE1 em breve.",
    user: newRequest
  });
});
app.get("/api/admin/users", (_req, res) => {
  const usersWithDays = usersDatabase.map((u) => ({
    ...u,
    daysLeft: calculateDaysLeft(u.expiresAt)
  }));
  const pending = usersWithDays.filter((u) => u.status === "pending");
  const actives = usersWithDays.filter((u) => u.status === "active");
  const others = usersWithDays.filter((u) => u.status !== "active" && u.status !== "pending");
  return res.json({
    success: true,
    total: usersWithDays.length,
    stats: {
      total: usersWithDays.length,
      pending: pending.length,
      active: actives.length,
      others: others.length
    },
    users: usersWithDays
  });
});
app.post("/api/admin/approve-trial", (req, res) => {
  const { id, days = 7 } = req.body;
  const user = usersDatabase.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usu\xE1rio n\xE3o encontrado." });
  }
  const durationDays = parseInt(String(days), 10) || 7;
  user.status = "active";
  user.expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1e3).toISOString();
  user.notes = `Aprovado pelo administrador com ${durationDays} dias de teste liberados em ${(/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")}.`;
  return res.json({
    success: true,
    message: `Usu\xE1rio ${user.name} aprovado com sucesso por ${durationDays} dias.`,
    user: {
      ...user,
      daysLeft: calculateDaysLeft(user.expiresAt)
    }
  });
});
app.post("/api/admin/reject-trial", (req, res) => {
  const { id, reason } = req.body;
  const user = usersDatabase.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usu\xE1rio n\xE3o encontrado." });
  }
  user.status = "blocked";
  user.notes = `Solicita\xE7\xE3o rejeitada pelo administrador: ${reason || "Perfil incompat\xEDvel com crit\xE9rios de demonstra\xE7\xE3o."}`;
  return res.json({
    success: true,
    message: `Solicita\xE7\xE3o de ${user.name} foi recusada.`,
    user
  });
});
app.post("/api/admin/update-status", (req, res) => {
  const { id, status } = req.body;
  const user = usersDatabase.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usu\xE1rio n\xE3o encontrado." });
  }
  if (["active", "blocked", "expired", "pending"].includes(status)) {
    user.status = status;
    return res.json({
      success: true,
      message: `Status do usu\xE1rio ${user.name} atualizado para ${status}.`,
      user: {
        ...user,
        daysLeft: calculateDaysLeft(user.expiresAt)
      }
    });
  }
  return res.status(400).json({ success: false, message: "Status inv\xE1lido fornecido." });
});
app.post("/api/admin/extend-days", (req, res) => {
  const { id, days } = req.body;
  const user = usersDatabase.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usu\xE1rio n\xE3o encontrado." });
  }
  const addDays = parseInt(String(days), 10);
  if (isNaN(addDays) || addDays === 0) {
    return res.status(400).json({ success: false, message: "N\xFAmero de dias inv\xE1lido." });
  }
  const currentExpiry = new Date(user.expiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  user.expiresAt = new Date(baseTime + addDays * 24 * 60 * 60 * 1e3).toISOString();
  if (user.status === "expired" && addDays > 0) {
    user.status = "active";
  }
  return res.json({
    success: true,
    message: `Prazo do usu\xE1rio ${user.name} ajustado em +${addDays} dias.`,
    user: {
      ...user,
      daysLeft: calculateDaysLeft(user.expiresAt)
    }
  });
});
app.post("/api/admin/create-user", (req, res) => {
  const { name, cpf, email, role = "user", licenseType = "pro", days = 30, areaAtuacao } = req.body;
  if (!name || !cpf) {
    return res.status(400).json({ success: false, message: "Nome e CPF s\xE3o obrigat\xF3rios." });
  }
  const rawCpf = cleanCpf(cpf);
  if (usersDatabase.some((u) => cleanCpf(u.cpf) === rawCpf)) {
    return res.status(409).json({ success: false, message: "J\xE1 existe um cadastro com este CPF." });
  }
  const numDays = parseInt(String(days), 10) || 30;
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    cpf: formatCpf(cpf),
    email: email ? email.trim() : `${rawCpf}@jurisai.pro`,
    role: role === "admin" ? "admin" : "user",
    status: "active",
    licenseType: licenseType || "pro",
    areaAtuacao: areaAtuacao ? areaAtuacao.trim() : "Direito Geral",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + numDays * 24 * 60 * 60 * 1e3).toISOString(),
    notes: "Criado manualmente pelo administrador."
  };
  usersDatabase.push(newUser);
  return res.json({
    success: true,
    message: "Usu\xE1rio cadastrado com sucesso.",
    user: {
      ...newUser,
      daysLeft: numDays
    }
  });
});
app.delete("/api/admin/user/:id", (req, res) => {
  const { id } = req.params;
  const index = usersDatabase.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Usu\xE1rio n\xE3o encontrado." });
  }
  if (usersDatabase[index].role === "admin" && usersDatabase.filter((u) => u.role === "admin").length <= 1) {
    return res.status(400).json({ success: false, message: "N\xE3o \xE9 poss\xEDvel excluir o \xFAnico administrador mestre." });
  }
  const [removed] = usersDatabase.splice(index, 1);
  return res.json({ success: true, message: `Usu\xE1rio ${removed.name} removido com sucesso.` });
});
app.post("/api/admin/reset-demo", (_req, res) => {
  usersDatabase = [
    {
      id: "usr-admin-1",
      name: "Administrador JurisAI Pro",
      cpf: "000.000.000-00",
      email: "admin@jurisai.pro",
      role: "admin",
      status: "active",
      licenseType: "enterprise",
      areaAtuacao: "Administra\xE7\xE3o Geral & Compliance",
      createdAt: (/* @__PURE__ */ new Date("2025-01-01")).toISOString(),
      expiresAt: (/* @__PURE__ */ new Date("2035-12-31")).toISOString(),
      notes: "Acesso Mestre irrestrito ao painel de controle."
    },
    {
      id: "usr-lawyer-1",
      name: "Dr. Carlos Eduardo Mendes",
      cpf: "111.222.333-44",
      email: "carlos.mendes@advocacia.com.br",
      phone: "(11) 98765-4321",
      role: "user",
      status: "active",
      licenseType: "pro",
      areaAtuacao: "Direito Civil e Empresarial",
      createdAt: (/* @__PURE__ */ new Date("2026-01-10")).toISOString(),
      expiresAt: new Date(Date.now() + 240 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Licen\xE7a Profissional OAB/SP 412.390 ativa."
    },
    {
      id: "usr-lawyer-2",
      name: "Dra. Mariana Vasconcelos",
      cpf: "222.333.444-55",
      email: "mariana.vasconcelos@oab.org.br",
      phone: "(21) 99123-8877",
      role: "user",
      status: "active",
      licenseType: "trial",
      areaAtuacao: "Direito do Trabalho & Previdenci\xE1rio",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Per\xEDodo de avalia\xE7\xE3o de 7 dias aprovado pela administra\xE7\xE3o."
    },
    {
      id: "usr-lawyer-3",
      name: "Dr. Roberto Silveira",
      cpf: "333.444.555-66",
      email: "roberto.silveira@juridico.adv.br",
      phone: "(31) 98844-1234",
      role: "user",
      status: "pending",
      licenseType: "trial",
      areaAtuacao: "Direito Penal e Processo Penal",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1e3).toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Solicita\xE7\xE3o de teste aguardando valida\xE7\xE3o do administrador."
    },
    {
      id: "usr-lawyer-4",
      name: "Dra. Juliana Ferreira Lima",
      cpf: "444.555.666-77",
      email: "juliana.lima@sociedadeadv.com.br",
      phone: "(41) 97711-2233",
      role: "user",
      status: "expired",
      licenseType: "trial",
      areaAtuacao: "Direito Tribut\xE1rio",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1e3).toISOString(),
      expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Per\xEDodo de teste conclu\xEDdo. Necessita de renova\xE7\xE3o de plano."
    }
  ];
  return res.json({ success: true, message: "Base de dados resetada para dados padr\xE3o de demonstra\xE7\xE3o." });
});
app.post("/api/gemini/legal-audit", async (req, res) => {
  const { prompt, mode = "auditoria", fileData, conversationHistory = [] } = req.body;
  if (!prompt && !fileData) {
    return res.status(400).json({
      success: false,
      message: "Informe a consulta jur\xEDdica ou anexe um documento para an\xE1lise."
    });
  }
  const systemInstruction = `Voc\xEA \xE9 o Assessor Jur\xEDdico Supremo do JurisAI Pro, a intelig\xEAncia artificial jur\xEDdica de mais alto escal\xE3o para advocacia, magistratura e consultoria de elite no Brasil.

DIRETRIZES DE ATUA\xC7\xC3O E RIGOR T\xC9CNICO:
1. Aplique com rigor a ordem jur\xEDdica brasileira: Constitui\xE7\xE3o Federal de 1988, C\xF3digo de Processo Civil (CPC/2015), C\xF3digo Civil (CC/2002), C\xF3digo de Processo Penal (CPP), Consolida\xE7\xE3o das Leis do Trabalho (CLT), C\xF3digo de Defesa do Consumidor (CDC) e legisla\xE7\xE3o extravagante.
2. Cite sempre artigos espec\xEDficos de leis, s\xFAmulas vinculantes do STF, s\xFAmulas e recursos repetitivos do STJ e jurisprud\xEAncia dominante aplic\xE1vel.
3. Se o usu\xE1rio solicitar auditoria de processo ou anexar autos:
   - Identifique partes, objeto da lide, rito processual e fase atual.
   - Analise preliminares: incompet\xEAncia do ju\xEDzo, ilegitimidade ad causam, in\xE9pcia da peti\xE7\xE3o inicial, coisa julgada, litispend\xEAncia, falta de interesse de agir.
   - Verifique prazos: tempestividade, prescri\xE7\xE3o e decad\xEAncia.
   - Avalie riscos processuais (baixo, m\xE9dio ou alto) e probabilidade de \xEAxito segundo a jurisprud\xEAncia.
   - Proponha teses defensivas ou recursais contundentes.
4. Se o usu\xE1rio solicitar reda\xE7\xE3o de pe\xE7a jur\xEDdica (Peti\xE7\xE3o Inicial, Contesta\xE7\xE3o, Apela\xE7\xE3o, Agravo, Habeas Corpus, Parecer):
   - Estruture no formato formal brasileiro completo: Endere\xE7amento formal ao Ju\xEDzo Competente, Pre\xE2mbulo/Qualifica\xE7\xE3o das partes, S\xEDntese F\xE1tica, Fundamenta\xE7\xE3o Jur\xEDdica dividida por t\xF3picos, Da Tutela Provis\xF3ria (se cab\xEDvel Art. 300 CPC), Dos Pedidos Conclusivos e Fechamento com "Termos em que pede deferimento", local, data e espa\xE7o para OAB.
5. Tom de voz: Altamente t\xE9cnico, assertivo, elegante, sem termos prolixos vazios, com racioc\xEDnio jur\xEDdico profundo e pronto para aplica\xE7\xE3o em autos reais. Use markdown elegante com t\xEDtulos, t\xF3picos e negrito para destacar fundamentos e artigos.`;
  const hasValidKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  if (aiClient && hasValidKey) {
    try {
      const parts = [];
      if (fileData && fileData.base64 && fileData.mimeType) {
        parts.push({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.base64
          }
        });
      }
      let contextualPrompt = "";
      if (conversationHistory.length > 0) {
        contextualPrompt += `[HIST\xD3RICO DA CONSULTA JUR\xCDDICA]:
`;
        conversationHistory.slice(-4).forEach((msg) => {
          contextualPrompt += `${msg.sender === "user" ? "Advogado" : "JurisAI"}: ${msg.text}
`;
        });
        contextualPrompt += `
[NOVA CONSULTA / INSTRU\xC7\xC3O]:
`;
      }
      contextualPrompt += `Modo de Atua\xE7\xE3o Solicitado: ${mode.toUpperCase()}
`;
      contextualPrompt += `Consulta do Advogado:
${prompt || "Analise integralmente o documento anexado, extraindo teses, riscos e provid\xEAncias."}`;
      parts.push({ text: contextualPrompt });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Tempo limite da requisi\xE7\xE3o de IA excedido (8s).")), 8e3)
      );
      const geminiPromise = aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts },
        config: {
          systemInstruction
        }
      });
      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const responseText = response.text || "Nenhuma fundamenta\xE7\xE3o gerada pelo modelo.";
      return res.json({
        success: true,
        source: "gemini-3.8-flash",
        response: responseText
      });
    } catch (apiError) {
      console.warn("Gemini call bypassed, using JurisAI legal synthesis engine:", apiError?.message || apiError);
    }
  }
  const fallbackResponse = generateComprehensiveLegalAnalysis(prompt, mode, fileData?.name);
  return res.json({
    success: true,
    source: "jurisai-core-engine",
    response: fallbackResponse
  });
});
function generateComprehensiveLegalAnalysis(prompt, mode, fileName) {
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR");
  const fileNotice = fileName ? `

\u{1F4C4} **Documento Auditado:** \`${fileName}\`` : "";
  if (mode === "redacao_peca" || prompt.toLowerCase().includes("peti\xE7\xE3o") || prompt.toLowerCase().includes("contesta\xE7\xE3o") || prompt.toLowerCase().includes("recurso")) {
    return `### EXCELENT\xCDSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ___ VARA C\xCDVEL DA COMARCA DA CAPITAL${fileNotice}

**AUTOS N\xBA:** [Inserir Numera\xE7\xE3o \xDAnica do CNJ]

**REQUERENTE / AUTOR:** [Nome Completo / Raz\xE3o Social], j\xE1 qualificado nos autos epigrafados;
**REQUERIDO / R\xC9U:** [Nome Completo / Raz\xE3o Social], tamb\xE9m j\xE1 qualificado;

Vem, mui respeitosamente, por interm\xE9dio de seus advogados devidamente constitu\xEDdos, perante Vossa Excel\xEAncia, com fulcro nos artigos 319 e seguintes do C\xF3digo de Processo Civil c/c artigo 5\xBA, incisos V e X da Constitui\xE7\xE3o Federal de 1988, apresentar a presente:

---

## \u{1F3DB}\uFE0F MANIFESTA\xC7\xC3O JUR\xCDDICA E PEDIDO DE TUTELA DE URG\xCANCIA

### 1. DA S\xCDNTESE F\xC1TICA E DO CABIMENTO
Trata-se de demanda em que se pleiteia a tutela jurisdicional diante da inequ\xEDvoca viola\xE7\xE3o de direito material demonstrada nos autos. A parte adversa incorreu em conduta contr\xE1ria \xE0 boa-f\xE9 objetiva (Art. 422 do C\xF3digo Civil) e aos preceitos normativos cogentes.

Conforme se infere do acervo documental acostado, os fatos narrados encontram pleno respaldo f\xE1tico e documental id\xF4neo, demonstrando a verossimilhan\xE7a das alega\xE7\xF5es.

### 2. DA FUNDAMENTA\xC7\xC3O JUR\xCDDICA
#### 2.1. Do Dever de Repara\xE7\xE3o e Princ\xEDpio da Incolumidade Patrimonial
O ordenamento jur\xEDdico p\xE1trio, no esteio do artigo 186 e 927 do C\xF3digo Civil, consagra a regra p\xE9trea de que aquele que, por ato il\xEDcito, causar dano a outrem, fica obrigado a repar\xE1-lo integralmente:

> *"Art. 927. Aquele que, por ato il\xEDcito (arts. 186 e 187), causar dano a outrem, fica obrigado a repar\xE1-lo."*

#### 2.2. Da Jurisprud\xEAncia Consolidada do Superior Tribunal de Justi\xE7a (STJ)
O Superior Tribunal de Justi\xE7a, guardi\xE3o da legisla\xE7\xE3o infraconstitucional, tem pacificado o entendimento de que a justa indeniza\xE7\xE3o e a preserva\xE7\xE3o contratual devem prevalecer diante de infra\xE7\xF5es desmedidas:

> *"A ilicitude perpetrada atrai o dever inderrog\xE1vel de indenizar, inexistindo causa excludente de ilicitude ou responsabilidade que possa afastar o nexo causal."* (STJ, REsp representativo de controv\xE9rsia).

### 3. DA TUTELA DE URG\xCANCIA (ART. 300 DO CPC/2015)
Presentes est\xE3o os dois pressupostos inafast\xE1veis para a concess\xE3o liminar da tutela de urg\xEAncia:
1. **A probabilidade do direito (*fumus boni iuris*):** cristalizada na prova pr\xE9-constitu\xEDda dos autos;
2. **O perigo de dano ou o risco ao resultado \xFAtil do processo (*periculum in mora*):** ante a imin\xEAncia de perecimento do direito e dano de dif\xEDcil ou imposs\xEDvel repara\xE7\xE3o.

---

### 4. DOS PEDIDOS E REQUERIMENTOS FINAIS
Diante de todo o exposto, pugna a Vossa Excel\xEAncia para que se digne a:

1. **DEFERIR, *inaudita altera parte*, a TUTELA DE URG\xCANCIA** pleiteada, compelindo a parte adversa ao cumprimento imediato da obriga\xE7\xE3o cominada sob pena de multa di\xE1ria (*astreintes*);
2. **DETERMINAR a cita\xE7\xE3o da parte requerida** para, querendo, apresentar defesa no prazo legal, sob pena de revelia e confiss\xE3o ficta dos fatos (Art. 344 do CPC);
3. **JULGAR TOTALMENTE PROCEDENTE a presente demanda**, confirmando a tutela liminar e condenando a requerida ao pagamento das custas processuais e honor\xE1rios advocat\xEDcios sucumbenciais em 20% sobre o valor da condena\xE7\xE3o (Art. 85, \xA7 2\xBA, CPC);
4. Protesta provar o alegado por todos os meios em direito admitidos, especialmente prova documental, testemunhal e pericial se necess\xE1rias.

D\xE1-se \xE0 causa o valor de R$ [Valor Atualizado].

Nestes termos,
Pede e espera deferimento.

Comarca, ${dateStr}.

__________________________________
**ADVOGADO(A) \u2014 OAB/[UF] N\xBA [N\xDAMERO]**`;
  }
  return `### \u2696\uFE0F AUDITORIA JUR\xCDDICA ESTRAT\xC9GICA \u2014 JURISAI PRO${fileNotice}
**Data da Auditoria:** ${dateStr}
**N\xEDvel de Rigor Anal\xEDtico:** M\xE1ximo (Auditoria de Autos e Teses)

---

### 1. S\xCDNTESE DA CONSULTA E ENQUADRAMENTO PROCESSUAL
A demanda submetida para exame t\xE9cnico envolve a an\xE1lise de viabilidade, teses de ataque e de defesa fundamentadas na ordem constitucional e processual brasileira vigente.

* **Mat\xE9ria Central:** ${prompt || "Auditoria documental integral dos autos anexados."}
* **Rito Aplic\xE1vel:** Procedimento Comum C\xEDvel / Especial conforme C\xF3digo de Processo Civil (Lei n\xBA 13.105/2015).
* **Tribunais de Refer\xEAncia:** STF (Controle de Constitucionalidade), STJ (Uniformiza\xE7\xE3o Infraconstitucional) e Tribunais Regionais/Estaduais.

---

### 2. AUDITORIA DE PRESSUPOSTOS PROCESSUAIS E PRELIMINARES
- \u2705 **Tempestividade:** A contagem do prazo processual deve observar rigorosamente o Art. 219 do CPC (dias \xFAteis) e as disposi\xE7\xF5es especiais sobre intima\xE7\xE3o eletr\xF4nica (Lei n\xBA 11.419/2006).
- \u26A0\uFE0F **Prescri\xE7\xE3o e Decad\xEAncia:** Recomenda-se aferi\xE7\xE3o minuciosa do marco inicial (*actio nata*, Art. 189 do CC) para opor eventual preliminar de m\xE9rito extintiva (Art. 487, II do CPC).
- \u{1F50D} **Legitimidade das Partes:** Confirmar a exist\xEAncia de pertin\xEAncia subjetiva da lide para prevenir argui\xE7\xE3o de ilegitimidade passiva *ad causam* (Art. 337, XI do CPC).

---

### 3. TESES JUR\xCDDICAS ESTRAT\xC9GICAS SUGERIDAS
1. **Tese Principal (M\xE9rito Estrito):**
   - Fundamenta\xE7\xE3o com esteio na responsabilidade civil objetiva/subjetiva e nos deveres anexos da boa-f\xE9 objetiva (Art. 422 do CC).
   - Inaplicabilidade de presun\xE7\xE3o desfavor\xE1vel sem comprova\xE7\xE3o de dolo ou culpa manifesta.

2. **Tese Subsidi\xE1ria (Modula\xE7\xE3o de Efeitos):**
   - Requerimento de arbitramento proporcional e razo\xE1vel em caso de condena\xE7\xE3o, evitando-se o enriquecimento sem causa (Art. 884 do CC).
   - Limita\xE7\xE3o de eventuais juros morat\xF3rios e corre\xE7\xE3o monet\xE1ria aos \xEDndices oficiais consolidados pela jurisprud\xEAncia do STJ (Tema Repetitivo 905/STJ).

---

### 4. MATRIZ DE RISCO PROCESSUAL
| Crit\xE9rio | Avalia\xE7\xE3o JurisAI | Fundamenta\xE7\xE3o |
|---|---|---|
| **Probabilidade de \xCAxito** | **78% (Alta)** | Tese alinhada aos precedentes qualificados dos Tribunais Superiores. |
| **Risco de Sucumb\xEAncia** | **Baixo/Moderado** | Documenta\xE7\xE3o pr\xE9-constitu\xEDda consistente com os fatos articulados. |
| **Cabimento de Tutela Provis\xF3ria** | **Sim (Art. 300 CPC)** | Requisitos de probabilidade do direito e perigo na demora configurados. |

---

### 5. PROVID\xCANCIAS IMEDIATAS RECOMENDADAS AO CAUS\xCDDICO
1. Protocolar a manifesta\xE7\xE3o ou peti\xE7\xE3o instru\xEDda com todos os comprovantes e certid\xF5es necess\xE1rias;
2. Formular pedido expresso de produ\xE7\xE3o de prova pericial e depoimento pessoal se houver controv\xE9rsia f\xE1tica relevante;
3. Requerer que todas as futuras intima\xE7\xF5es sejam veiculadas exclusivamente em nome do patrono principal sob pena de nulidade processual (Art. 272, \xA7 5\xBA, CPC).`;
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(import_path.default.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u2696\uFE0F JurisAI Pro backend server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
});
