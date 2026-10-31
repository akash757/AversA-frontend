# AversA Agents Frontend

Autonomous SDLC Platform - Frontend Web Application built with [Next.js](https://nextjs.org) and Tailwind CSS.


## Getting Started

1. Install dependencies:
```bash
npm installl
```

2. Configure environment:
Create `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

3. Run development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## Production Build & AWS EC2 Deployment

1. Build application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start
```

### Running with PM2 on AWS EC2:
```bash
npm install -g pm2
pm2 start npm --name "AversA-frontend" -- start -- -p 3000
pm2 save
pm2 startup
```
