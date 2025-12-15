import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Heart, PawPrint, Users, Megaphone, HelpCircle, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CommunityPost {
  id: string;
  title: string;
  category: string;
  content: string | null;
  image_url: string | null;
  created_at: string | null;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Heart> = {
    'Mascotas perdidas': Search,
    'Ayuda a albergues': Heart,
    'Voluntariado': Users,
    'Adopciones': PawPrint,
    'Campañas': Megaphone,
    'Otro': HelpCircle,
  };
  return icons[category] || HelpCircle;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Mascotas perdidas': 'bg-red-500',
    'Ayuda a albergues': 'bg-pink-500',
    'Voluntariado': 'bg-blue-500',
    'Adopciones': 'bg-green-500',
    'Campañas': 'bg-purple-500',
    'Otro': 'bg-gray-500',
  };
  return colors[category] || 'bg-muted';
};

export default function ComunidadDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('id, title, category, content, image_url, created_at')
      .eq('id', postId)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching post:', error);
      setNotFound(true);
    } else if (!data) {
      setNotFound(true);
    } else {
      setPost(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/4 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <PawPrint className="h-20 w-20 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Publicación no encontrada</h1>
          <p className="text-muted-foreground mb-6">
            La publicación que buscas no existe o ya no está disponible.
          </p>
          <Link to="/comunidad">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Comunidad
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const IconComponent = getCategoryIcon(post.category);

  return (
    <Layout>
      <article className="container py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/comunidad">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Comunidad
          </Button>
        </Link>

        {/* Hero Image */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
          ) : (
            <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <PawPrint className="h-24 w-24 text-primary/50" />
            </div>
          )}
          <Badge 
            className={`absolute top-4 left-4 ${getCategoryColor(post.category)} text-white border-0 gap-1 text-sm px-3 py-1`}
          >
            <IconComponent className="h-4 w-4" />
            {post.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {post.title}
          </h1>

          {post.created_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.created_at}>
                {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </time>
            </div>
          )}

          {post.content && (
            <div className="prose prose-lg max-w-none text-foreground/90">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Back to Community */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/comunidad">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ver más publicaciones
            </Button>
          </Link>
        </div>
      </article>
    </Layout>
  );
}
