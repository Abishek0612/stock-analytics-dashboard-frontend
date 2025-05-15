# Stock Analytics Dashboard - Frontend

A sophisticated Next.js application that provides interactive stock market analytics and visualization to help users make informed investment decisions.

![Dashboard Screenshot](public/dashboard-screenshot.png)
![Profile Screenshot](public/profile-screenshot.png)
![Settings Screenshot](public/settings-screenshot.png)
![Home Page Screenshot](public/home-screenshot.png)

## 🚀 Features

- **Interactive Stock Charts**: Compare multiple stocks simultaneously with responsive charts
- **Multiple Timeframes**: Analyze stock performance across various periods (1D, 1W, 1M, 3M, 1Y, YTD, MTD, custom range)
- **User Authentication**: Secure signup and login flow with JWT authentication
- **User Profiles**: Save favorite stocks and custom dashboard configurations
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Dark/Light Mode**: Full theme support with system preference detection
- **Real-time Data Visualization**: Dynamic updates of stock information
- **Personalized Settings**: Customizable chart preferences, notifications, and appearance
- **Advanced Error Handling**: Graceful fallbacks and retries for API failures

## 🔍 Advanced Features

1. **Intelligent Data Fetching**: Optimized with caching and error handling
2. **Custom Error Boundaries**: Graceful fallbacks for chart errors
3. **Rate Limiting Protection**: Handles API rate limits gracefully
4. **Performance Optimizations**: Code splitting, lazy loading, and memoization
5. **Responsive Chart Resizing**: Charts adapt to any screen size
6. **Custom Theme Support**: Seamless dark/light mode transitions
7. **Profile Photo Management**: Upload and manage user photos
8. **Dashboard Configurations**: Save and load favorite stock combinations
9. **Custom Date Range Selection**: For detailed stock analysis

## 🔧 Technologies

- **Next.js 13+**: Using the App Router architecture
- **React 18**: With hooks, context API, and suspense
- **Tailwind CSS**: For responsive and customizable UI components
- **ECharts**: For interactive and dynamic stock charts
- **SWR**: For data fetching, caching, and revalidation
- **JWT Authentication**: Secure user authentication and authorization
- **React Hook Form**: Form validation with Zod schema validation
- **React Icons**: Comprehensive icon library
- **Next Themes**: For dark/light mode support

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18.x or higher
- npm

### Installation Steps

1. Clone the repository:
   git clone https://github.com/Abishek0612/stock-analytics-dashboard-frontend.git
   cd stock-analytics-frontend

2. Install dependencies:
   npm install

3. Create a `.env.local` file in the root directory:
   NEXT_PUBLIC_API_URL=http://localhost:5000/api

4. Start the development server:
   npm run dev
