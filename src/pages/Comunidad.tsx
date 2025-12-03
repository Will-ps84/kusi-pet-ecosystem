import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Heart, PawPrint, Users, Megaphone, HelpCircle, Search } from 'lucide-react';
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

const CATEGORIES = [
  { value: 'all', label: 'Todos', icon: null },
  { value: 'Mascotas perdidas', label: 'Mascotas perdidas', icon: Search },
  { value: 'Ayuda a albergues', label: 'Ayuda a albergues', icon: Heart },
  { value: 'Voluntariado', label: 'Voluntariado', icon: Users },
  { value: 'Adopciones', label: 'Adopciones', icon: PawPrint },
  { value: 'Campañas', label: 'Campañas', icon: Megaphone },
  { value: 'Otro', label: 'Otro', icon: HelpCircle },
];

const getCategoryIcon = (category: string) => {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat?.icon;
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

export default function Comunidad() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('id, title, category, content, image_url, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Heart className="h-5 w-5" />
            <span className="font-medium">Comunidad Kusi Pet</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Juntos por nuestras mascotas
          </h1>
          <p className="text-muted-foreground text-lg">
            Un espacio para ayudar a mascotas perdidas, apoyar albergues, encontrar voluntarios 
            y promover adopciones responsables. ¡Tu ayuda hace la diferencia!
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="gap-2"
            >
              {cat.icon && <cat.icon className="h-4 w-4" />}
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No hay publicaciones en esta categoría
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Pronto tendremos contenido aquí. ¡Vuelve más tarde!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const IconComponent = getCategoryIcon(post.category);
              return (
                <Link key={post.id} to={`/comunidad/${post.id}`}>
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <PawPrint className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                      <Badge 
                        className={`absolute top-3 left-3 ${getCategoryColor(post.category)} text-white border-0 gap-1`}
                      >
                        {IconComponent && <IconComponent className="h-3 w-3" />}
                        {post.category}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-3 flex-1">
                        {truncateText(post.content, 150)}
                      </p>
                      {post.created_at && (
                        <p className="text-xs text-muted-foreground mt-3">
                          {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
