# Launch 🚀

Launch is a cloud IDE inspired by tools like Replit, Cursor, and GitHub workspaces. The goal of this project is to create an IDE that students can easily access on their chromebook. I want them to be able to access the website, code something, and then publish it to the world.

When I first started my programming journey, 000webhost (A free PHP hosting website) was one of the first services I used. It allowed people to host their creations publicly for free, and it really motivated me knowing my friends could visit the website. I aim to create something similar that can inspire students to start coding.

I am also creating this project to take an opportunity to learn technologies I am unfamiliar with, such as:

- Next JS
- Monorepo
- Docker
- Prisma
- Supabase
- Typescript
- Yjs

# Choices

- **Next.js:** I went with Next.js because it allows me to keep my client UI and core server logic in a single codebase. This saves a massive amount of time by eliminating the need to build out a custom routing system from scratch and allowing me to implement authentication cleanly, letting me focus on building out the main application features.
- **Monorepo Architecture:** I chose a monorepo workspace because the platform is split into two distinct services: the main web application and a separate service layer for managing user projects and Docker containers. I did this because managing containers is a resource intensive task, and separating the jobs ensures that a crash can never bring down the primary user dashboard.

# Adding more to this README soon!
