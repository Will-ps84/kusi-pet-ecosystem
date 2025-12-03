import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, Heart, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CommunityPost {
  id: string;
  title: string;
  category: string;
  content: string | null;
  image_url: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const CATEGORIES = [
  'Mascotas perdidas',
  'Ayuda a albergues',
  'Voluntariado',
  'Adopciones',
  'Campañas',
  'Otro',
];

export function AdminCommunity() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar las publicaciones', variant: 'destructive' });
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setContent('');
    setImageUrl('');
    setIsPublished(true);
    setEditingPost(null);
  };

  const openCreateSheet = () => {
    resetForm();
    setSheetOpen(true);
  };

  const openEditSheet = (post: CommunityPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setContent(post.content || '');
    setImageUrl(post.image_url || '');
    setIsPublished(post.is_published ?? true);
    setSheetOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `comunidad/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mascotas')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('mascotas')
        .getPublicUrl(filePath);

      setImageUrl(urlData.publicUrl);
      toast({ title: 'Imagen subida', description: 'La imagen se ha subido correctamente' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !category) {
      toast({ title: 'Error', description: 'El título y la categoría son requeridos', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: title.trim(),
        category,
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
      };

      if (editingPost) {
        // Update
        const { error } = await supabase
          .from('community_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({ title: 'Actualizado', description: 'Publicación actualizada correctamente' });
      } else {
        // Create
        const { error } = await supabase
          .from('community_posts')
          .insert(postData);

        if (error) throw error;
        toast({ title: 'Creado', description: 'Publicación creada correctamente' });
      }

      setSheetOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({ title: 'Error', description: 'No se pudo guardar la publicación', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      toast({ title: 'Eliminado', description: 'Publicación eliminada correctamente' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la publicación', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Gestión de Comunidad
            </CardTitle>
            <CardDescription>{posts.length} publicaciones</CardDescription>
          </div>
          <Button onClick={openCreateSheet} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Publicación
          </Button>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay publicaciones aún. ¡Crea la primera!
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {post.image_url && (
                            <img 
                              src={post.image_url} 
                              alt="" 
                              className="h-10 w-10 rounded object-cover hidden sm:block"
                            />
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{post.title}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{post.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {post.created_at && format(new Date(post.created_at), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.is_published ? 'default' : 'secondary'}>
                          {post.is_published ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditSheet(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingPost ? 'Editar Publicación' : 'Nueva Publicación'}</SheetTitle>
            <SheetDescription>
              {editingPost ? 'Modifica los datos de la publicación' : 'Crea una nueva publicación para la comunidad'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Perrito perdido en Miraflores"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe los detalles de la publicación..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen</Label>
              {imageUrl && (
                <div className="relative mb-2">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl('')}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <p className="text-xs text-muted-foreground">O pega una URL de imagen:</p>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="published">Publicado</Label>
                <p className="text-xs text-muted-foreground">
                  La publicación será visible para todos
                </p>
              </div>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPost ? 'Guardar Cambios' : 'Crear Publicación'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
