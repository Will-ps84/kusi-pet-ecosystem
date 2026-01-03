import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Privacidad() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Política de Privacidad</CardTitle>
            <p className="text-muted-foreground">Última actualización: Enero 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Introducción */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Introducción</h2>
              <p className="text-muted-foreground leading-relaxed">
                En Kusi Pet, nos comprometemos a proteger tu privacidad y la de tus mascotas.
                Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
              </p>
            </section>

            <Separator />

            {/* Información que Recopilamos */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Información que Recopilamos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Recopilamos la siguiente información cuando utilizas Kusi Pet:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Información de cuenta:</strong> Nombre, correo electrónico, número de teléfono</li>
                <li><strong>Información de mascotas:</strong> Nombre, especie, raza, edad, fotos</li>
                <li><strong>Información de pedidos:</strong> Dirección de entrega, historial de compras</li>
                <li><strong>Datos de uso:</strong> Interacciones con la plataforma, preferencias</li>
              </ul>
            </section>

            <Separator />

            {/* Uso de la Información */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Uso de la Información</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Personalizar tu experiencia en la plataforma</li>
                <li>Procesar pedidos y entregas</li>
                <li>Comunicarnos contigo sobre actualizaciones y promociones</li>
                <li>Garantizar la seguridad de la plataforma</li>
              </ul>
            </section>

            <Separator />

            {/* Protección de Datos */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Protección de Datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal
                contra acceso no autorizado, pérdida o alteración. Esto incluye:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Encriptación de datos sensibles</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Actualizaciones regulares de nuestros sistemas</li>
              </ul>
            </section>

            <Separator />

            {/* Compartir Información */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Compartir Información</h2>
              <p className="text-muted-foreground leading-relaxed">
                No vendemos ni alquilamos tu información personal a terceros. Podemos compartir datos con:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
                <li>Socios de entrega para completar tus pedidos</li>
                <li>Autoridades cuando sea requerido por ley</li>
              </ul>
            </section>

            <Separator />

            {/* Tus Derechos */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Tus Derechos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Acceder a tu información personal</li>
                <li>Solicitar la corrección de datos incorrectos</li>
                <li>Solicitar la eliminación de tu cuenta y datos</li>
                <li>Oponerte al procesamiento de tus datos para fines de marketing</li>
              </ul>
            </section>

            <Separator />

            {/* Cookies */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies para mejorar tu experiencia en la plataforma, recordar tus preferencias
                y analizar el uso del sitio. Puedes configurar tu navegador para rechazar cookies,
                aunque esto puede afectar algunas funcionalidades.
              </p>
            </section>

            <Separator />

            {/* Cambios en la Política */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Cambios en esta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre
                cambios significativos a través de la plataforma o por correo electrónico.
              </p>
            </section>

            <Separator />

            {/* Contacto */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">9. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para consultas sobre privacidad o ejercer tus derechos, contáctanos:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Correo electrónico: comunidad@kusipet.com</li>
                <li>WhatsApp: +51 997 227 638</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
