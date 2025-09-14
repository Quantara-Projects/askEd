import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed w-full top-0 z-50 bg-card/60 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.builder.io/api/v1/image/assets%2Ff7636dbc154444f9897eafaf4c70d8a5%2F72ff5047f88d49358f7660cd47a9a514?format=webp&width=800" alt="AskEd" className="w-8 h-8 rounded-md" />
            <span className="font-semibold">AskEd</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#community" className="hover:underline">Community</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">AskEd — Your Personalized AI Learning Assistant</h1>
          <p className="text-muted-foreground mb-8">Get answers, summaries, quizzes, and more in one place.</p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/chat" className="px-6 py-3 rounded-md bg-gradient-primary text-primary-foreground shadow-md hover:shadow-glow transition">Access Beta</Link>
            <a href="#pricing" className="px-6 py-3 rounded-md border">View Premium Features</a>
          </div>

          <section id="features" className="mt-16 text-left">
            <h2 className="text-2xl font-semibold mb-6">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card/50 hover:shadow-glow transition">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-semibold">Adaptive Learning</h3>
                <p className="text-sm text-muted-foreground mt-2">Personalized study plans that adapt to your strengths and weaknesses.</p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50 hover:shadow-glow transition">
                <div className="text-3xl mb-2">🧩</div>
                <h3 className="font-semibold">Gamification</h3>
                <p className="text-sm text-muted-foreground mt-2">Streaks, badges, and leaderboards to keep learners engaged.</p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50 hover:shadow-glow transition">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold">Smart Summaries</h3>
                <p className="text-sm text-muted-foreground mt-2">Summarize long articles, textbooks, or lecture notes instantly.</p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50 hover:shadow-glow transition">
                <div className="text-3xl mb-2">✍️</div>
                <h3 className="font-semibold">Homework Checker</h3>
                <p className="text-sm text-muted-foreground mt-2">Check math, code, and written work with step-by-step feedback.</p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50 hover:shadow-glow transition">
                <div className="text-3xl mb-2">🎤</div>
                <h3 className="font-semibold">Voice Input & Output</h3>
                <p className="text-sm text-muted-foreground mt-2">Use your voice to ask questions and listen to explanations.</p>
              </div>

              <div className="p-4 rounded-lg border bg-card/50 hover:shadow-glow transition">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold">Privacy & Control</h3>
                <p className="text-sm text-muted-foreground mt-2">Control your data, API keys, and privacy settings from the dashboard.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm">
        <div className="max-w-4xl mx-auto">Quantara Corp — contact@quantara.example</div>
      </footer>
    </div>
  );
};

export default Home;
