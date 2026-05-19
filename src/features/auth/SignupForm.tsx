import type { FormEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SignupForm = () => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signup({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit">Sign Up</button>
    </form>
  );
};
