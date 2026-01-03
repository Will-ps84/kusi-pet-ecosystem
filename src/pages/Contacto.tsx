import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    mensaje: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío (implementar backend después)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('¡Gracias por contactarnos! Te responderemos pronto.');
    setFormData({ nombre: '', correo: '', mensaje: '' });
    setIsSubmitting(false);
  };

  const WHATSAPP_NUMBER = '51997227638';
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Kusi Pet, tengo una consulta.')}`;

  return (
    <Layout>
      <div className="container max-w-5xl py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Contacto</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes alguna pregunta, sugerencia o necesitas ayuda? Estamos aquí para ti.
            Puedes escribirnos por correo electrónico, WhatsApp o usar el formulario a continuación.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Correo Electrónico
                </CardTitle>
                <CardDescription>
                  Escríbenos para consultas generales o soporte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:comunidad@kusipet.com" 
                  className="text-lg font-medium text-primary hover:underline"
                >
                  comunidad@kusipet.com
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Respondemos en un plazo máximo de 24 horas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Para respuestas más rápidas, contáctanos por WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">+51 997 227 638</span>
                </div>
                <Button 
                  asChild 
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chatear por WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Horario de atención */}
            <Card>
              <CardHeader>
                <CardTitle>Horario de Atención</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Lunes a Viernes:</span>
                    <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sábados:</span>
                    <span className="font-medium text-foreground">10:00 AM - 2:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Domingos y feriados:</span>
                    <span className="font-medium text-foreground">Cerrado</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un Mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correo">Correo electrónico</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="tu@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje</Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    placeholder="¿En qué podemos ayudarte?"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.mensaje.length}/1000 caracteres
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
