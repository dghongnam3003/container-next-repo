import UserRegistrationForm from '@/components/UserRegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-foreground/70">Sign up to get started</p>
        </div>
        <UserRegistrationForm />
      </div>
    </div>
  );
}