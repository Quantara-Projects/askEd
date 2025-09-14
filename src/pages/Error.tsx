import { useLocation, Link } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const state = (location.state as { error?: string; status?: number; info?: unknown }) || {};

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 animate-glow" />
        <h1 className="text-2xl font-semibold mb-2">Uh-oh an error occured, AskEd is on its way to fix it!.</h1>
        <p className="text-muted-foreground mb-6">Something unexpected happened. You can go back and try again.</p>
        <div className="rounded-lg border bg-card text-left p-4">
          <p className="text-sm font-medium mb-2">Details</p>
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
{JSON.stringify({ status: state.status, error: state.error, info: state.info }, null, 2)}
          </pre>
        </div>
        <Link to="/" className="inline-block mt-6 px-4 py-2 rounded-md bg-gradient-primary text-primary-foreground">Return Home</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
