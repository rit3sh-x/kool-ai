# Kool AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

**Transform ideas into production-ready web applications through conversational AI.**

Kool AI is an intelligent development platform that bridges the gap between concept and deployment. Using advanced Large Language Models (LLMs) and automated sandboxing technology, it generates, previews, and hosts full-stack Next.js applications from natural language descriptions—no coding required.

## 🚀 What Makes Kool AI Different

**Conversational Development**: Describe your vision in plain English, and watch as Kool AI architects, builds, and deploys your application with enterprise-grade code quality.

**Instant Gratification**: From concept to live preview in seconds. Every generated application runs in a secure, isolated environment with real-time interaction capabilities.

**Production-First Approach**: Generated code follows industry best practices, leveraging modern frameworks and patterns for scalability and maintainability.

## ✨ Core Capabilities

### 🤖 Intelligent Code Generation

- **Natural Language Processing**: Transform conversational descriptions into structured, production-ready applications
- **Context-Aware Development**: Maintains project context across iterations for consistent, coherent codebases
- **Best Practice Enforcement**: Automatically applies coding standards, security patterns, and performance optimizations

### 🔒 Secure Sandboxing

- **Isolated Execution**: Each project runs in dedicated E2B containers with complete resource isolation
- **Real-Time Preview**: Live application testing with full interactivity and debugging capabilities
- **Zero Infrastructure Overhead**: Automatic provisioning and teardown of development environments

## 🏗️ Technical Architecture

### Frontend Stack

- **Next.js 15** with App Router for optimal performance and SEO
- **React 19** with concurrent features for enhanced user experience
- **Shadcn UI** component library ensuring accessibility and consistency
- **Tailwind CSS** for utility-first styling with design system integration

### Backend Infrastructure

- **tRPC** for type-safe, end-to-end API communication
- **Prisma ORM** with automated migrations and type generation
- **Clerk Authentication** providing secure, scalable user management

### AI & Orchestration

- **Inngest Agent Kit** for reliable AI agent orchestration
- **OpenAI-Compatible APIs** supporting multiple LLM providers
- **E2B Sandboxing** for secure code execution and hosting

### Data & State Management

- **PostgreSQL** for robust data persistence

## 🛠️ Development Setup

### System Requirements

| Component | Minimum Version | Recommended |
| --------- | --------------- | ----------- |
| Node.js   | 22.0.0          | 22.x LTS    |
| npm       | 9.0.0           | Latest      |
| Docker    | 24.0.0          | Latest      |
| Memory    | 8GB RAM         | 16GB RAM    |

### Quick Start

1. **Repository Setup**

   ```bash
   git clone https://github.com/rit3sh-x/kool-ai.git
   cd kool-ai
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Configure your API keys and database URLs
   ```

3. **Database Initialization**

   ```bash
   npx prisma migrate dev
   ```

4. **E2B Sandbox Configuration**

   ```bash
   # Install E2B CLI globally
   npm install -g e2b

   # Authenticate with E2B
   e2b login

   # Build and deploy sandbox template
   cd ./sandbox/nextjs
   e2b template build --name <your-template-name> --cmd compile_page.sh
   ```

5. **Development Server Launch**

   ```bash
   # Start the Next.js development server
   npm run dev

   # In a separate terminal, start the Inngest worker
   npx inngest-cli@latest dev
   ```

Access your development environment at `http://localhost:3000`

### Production Deployment

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
kool-ai/
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   ├── components/          # Reusable UI components
│   ├── modules/            # Feature-specific modules
│   │   ├── projects/       # Project management logic
│   │   ├── messages/       # Chat and communication
│   │   ├── home/          # Dashboard and navigation
│   │   └── usage/         # Analytics and monitoring
│   ├── trpc/              # Type-safe API layer
│   ├── inngest/           # AI agent orchestration
│   ├── lib/               # Shared utilities and helpers
│   └── types/             # TypeScript type definitions
├── sandbox/
│   └── nextjs/            # E2B container configuration
├── prisma/                # Database schema and migrations
└── public/               # Static assets
```

## 🎯 Usage Guide

### Creating Your First Project

1. **Authentication**: Sign in using your preferred OAuth provider through Clerk
2. **Project Initialization**: Click "New Project" and describe your application requirements
3. **AI Interaction**: Engage in conversational development to refine features and functionality
4. **Live Preview**: Test your application in real-time within the secure sandbox environment
5. **Deployment**: Deploy directly to production or export code for custom hosting

### Advanced Features

**Custom Templates**: Define reusable project templates for consistent development patterns
**API Integration**: Connect external services and databases through guided configuration
**Performance Optimization**: Automatic code splitting, lazy loading, and bundle optimization
**Security Hardening**: Built-in OWASP compliance and vulnerability scanning

## 🔧 Configuration Options

### Model Configuration (`src/lib/modelProps.ts`)

```typescript
// Specify the default base model for code generation
export const baseModel = "<your-base-model-name>";

// Specify the model used for summarization tasks
export const summaryModel = "<your-summary-model-name>";

// Provide your LLM API key via environment variables
export const apiKey = process.env.LLM_API_KEY!;

// Set the base URL for your LLM API provider
export const baseUrl = "<your-llm-api-base-url>";

// Define the sandbox template name for E2B
export const sandboxName = "<your-sandbox-template-name>";
```

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Workflow

1. Fork the repository and create a feature branch
2. Implement your changes with comprehensive tests
3. Ensure code quality with our linting and formatting tools
4. Submit a pull request with detailed description and screenshots

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality assurance

### Testing Requirements

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user workflows

## 📊 Performance & Scalability

- **Sub-second Response Times**: Optimized LLM interactions with intelligent caching
- **Horizontal Scaling**: Containerized architecture supporting auto-scaling
- **Global CDN**: Static asset delivery through edge networks
- **Database Optimization**: Query optimization and connection pooling

## 🔐 Security & Compliance

- **Data Encryption**: End-to-end encryption for all sensitive data
- **Sandbox Isolation**: Complete process and network isolation for user code
- **Access Control**: Role-based permissions with audit logging
- **Compliance**: SOC 2 Type II and GDPR compliance ready

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with cutting-edge technologies from:

- [Vercel](https://vercel.com) for Next.js framework
- [Clerk](https://clerk.dev) for authentication infrastructure
- [E2B](https://e2b.dev) for secure sandboxing technology
- [Inngest](https://inngest.com) for reliable workflow orchestration

---

**Ready to transform your ideas into reality?** [Get started with Kool AI](https://your-kool-ai-domain.com) and experience the future of web development.
