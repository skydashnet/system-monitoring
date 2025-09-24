# Skydash.NET - Server Monitoring Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Svelte](https://img.shields.io/badge/Svelte-5-%23FF3E00.svg?logo=svelte)](https://svelte.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.x-%23000000.svg?logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-%2306B6D4.svg?logo=tailwindcss)](https://tailwindcss.com/)

**Skydash.NET** is a comprehensive and modern server monitoring dashboard. Built with a high-performance tech stack (Bun, ElysiaJS, Svelte), this application provides real-time visualization and in-depth control over vital server metrics, accessible directly from your browser.

---

## ✨ Key Features

-   **Real-time Dashboard:** Monitor vital metrics (CPU, RAM, Disk, Network, Load Average) with smooth animations and live updates via WebSockets.
-   **Interactive Charts:** Visualize CPU & Network usage history with dynamic charts complete with informative tooltips.
-   **Advanced Process Management:** View, search, and sort all running processes. Equipped with a **Kill Process** functionality to terminate processes directly from the user interface.
-   **Docker Container Management:** Get a complete list of Docker containers, view their status, and resource usage. Equipped with **Start, Stop, Restart** actions, as well as a detail modal to view logs.
-   **Detailed System Information:** Provides a complete breakdown of your server's hardware and software specifications, from the CPU, Motherboard, and RAM to network interface details.
-   **Modern & Responsive Design:** Built with Tailwind CSS, the user interface is fully adaptive for both desktop and mobile devices, and includes a custom scrollbar that matches the application's theme.
-   **Simple Authentication:** Comes with a login page to protect access to the dashboard.

## 🚀 Tech Stack

| Component    | Technology                                                                    |
| :---------- | :--------------------------------------------------------------------------- |
| **Backend** | [Bun](https://bun.sh/), [ElysiaJS](https://elysiajs.com/), [TypeScript](https://www.typescriptlang.org/), [SystemInformation](https://systeminformation.io/) |
| **Frontend**| [SvelteKit](https://kit.svelte.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Chart.js](https://www.chartjs.org/), [Lucide Icons](https://lucide.dev/) |
| **Database**| [MariaDB](https://mariadb.org/) _(planned for historical data storage)_ |

---

## 🛠️ Running Locally

To run Skydash.NET in your local environment, please follow the steps below.

### Prerequisites

-   [Bun](https://bun.sh/) (v1.0 or newer)
-   [Git](https://git-scm.com/)
-   Docker installed and running (required for the Docker management feature)

### Installation

1.  **Clone this repository:**
    ```bash
    git clone [https://github.com/skydashnet/system-monitoring.git](https://github.com/skydashnet/system-monitoring.git)
    cd system-monitoring
    ```

2.  **Configure & Run the Backend:**
    Open a new terminal session, navigate to the `backend` directory, install dependencies, and run the server.
    ```bash
    cd backend
    bun install
    bun run src/index.ts
    ```
    The backend server will run on `http://localhost:3001`.

3.  **Configure & Run the Frontend:**
    Open another terminal session, navigate to the `frontend` directory, install dependencies, and run the development server.
    ```bash
    cd frontend
    bun install
    bun run dev -- --open
    ```
    The application will automatically open in your browser at `http://localhost:5173`.

### Login Credentials

Use the following credentials to log in to the dashboard:
-   **Username**: `admin`
-   **Password**: `admin`

---

## 🤝 Contributing

If you find an area for improvement or have an idea for a new feature, contributions are greatly appreciated. Please fork this repository, create a new branch, and submit a Pull Request.

1.  Fork this repository.
2.  Create a new feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add some NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---
*open-source* by **Skydash.NET**.