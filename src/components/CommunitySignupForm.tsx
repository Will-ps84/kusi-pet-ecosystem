import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CommunitySignupFormProps {
  variant?: 'default' | 'compact';
}

export function CommunitySignupForm({ variant = 'default' }: CommunitySignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [petType, setPetType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !petType) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll show success - in production this would connect to Mailchimp API
      // The user can embed Mailchimp form or add API integration later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      toast.success('¡Bienvenido a la comunidad Kusi Pet!');
    } catch (error) {
      toast.error('Hubo un error. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          ¡Gracias por unirte a la comunidad Kusi Pet!
        </h3>
        <p className="text-muted-foreground">
          Revisa tu correo en las próximas horas para recibir tus primeros contenidos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="petType">Tipo de mascota</Label>
        <Select value={petType} onValueChange={setPetType} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="perro">🐕 Perro</SelectItem>
            <SelectItem value="gato">🐱 Gato</SelectItem>
            <SelectItem value="ambos">🐕🐱 Ambos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        variant="hero" 
        size="lg" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          'Enviando...'
        ) : (
          <>
            <Heart className="h-5 w-5" />
            Quiero recibir contenidos y acceso anticipado
          </>
        )}
      </Button>
    </form>
  );
}