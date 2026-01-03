import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Terminos() {
  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Términos y Condiciones</CardTitle>
            <p className="text-muted-foreground">Última actualización: Enero 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Introducción */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Introducción</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bienvenido a Kusi Pet. Al acceder y utilizar nuestra plataforma, aceptas estos términos y condiciones de uso.
                Te recomendamos leerlos detenidamente antes de utilizar nuestros servicios.
              </p>
            </section>

            <Separator />

            {/* Uso del Servicio */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Uso del Servicio</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kusi Pet es una plataforma pet-tech diseñada para conectar a la comunidad de amantes de mascotas en Lima, Perú.
                Nuestros servicios incluyen:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Comunidad de tips y consejos para el cuidado de mascotas</li>
                <li>Gestión de perfiles de mascotas</li>
                <li>Marketplace de productos para mascotas (próximamente disponible al público)</li>
                <li>Conexión con otros dueños de mascotas</li>
              </ul>
            </section>

            <Separator />

            {/* Registro de Cuenta */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Registro de Cuenta</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para acceder a ciertas funcionalidades de Kusi Pet, es necesario crear una cuenta.
                Al registrarte, te comprometes a proporcionar información veraz y mantenerla actualizada.
              </p>
            </section>

            <Separator />

            {/* Responsabilidades del Usuario */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Responsabilidades del Usuario</h2>
              <p className="text-muted-foreground leading-relaxed">
                Como usuario de Kusi Pet, te comprometes a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Utilizar la plataforma de manera responsable y respetuosa</li>
                <li>No compartir contenido ofensivo, falso o que viole derechos de terceros</li>
                <li>Mantener la confidencialidad de tus credenciales de acceso</li>
                <li>Reportar cualquier uso indebido que detectes en la plataforma</li>
              </ul>
            </section>

            <Separator />

            {/* Propiedad Intelectual */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Propiedad Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo el contenido de Kusi Pet, incluyendo logo, diseño, textos e imágenes, está protegido por derechos de autor
                y es propiedad de Kusi Pet o de sus respectivos propietarios.
              </p>
            </section>

            <Separator />

            {/* Limitación de Responsabilidad */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">6. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kusi Pet no se hace responsable por daños directos o indirectos derivados del uso de la plataforma.
                El contenido compartido por usuarios representa únicamente sus opiniones personales.
              </p>
            </section>

            <Separator />

            {/* Modificaciones */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">7. Modificaciones</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kusi Pet se reserva el derecho de modificar estos términos en cualquier momento.
                Los cambios serán notificados a través de la plataforma y entrarán en vigencia desde su publicación.
              </p>
            </section>

            <Separator />

            {/* Contacto */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">8. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si tienes preguntas sobre estos términos, puedes contactarnos a través de:
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
