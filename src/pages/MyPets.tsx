import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Pet, PetSpecies, PetSex, SPECIES_LABELS, SEX_LABELS } from '@/lib/types';
import { Plus, Edit2, Trash2, PawPrint, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PetDetailSheet } from '@/components/pets/PetDetailSheet';

const emptyPet = {
  name: '',
  species: 'gato' as PetSpecies,
  breed: '',
  color: '',
  sex: 'macho' as PetSex,
  age_years: '',
  weight_kg: '',
  birthday: '',
  important_notes: '',
};

export default function MyPets() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState(emptyPet);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pet detail sheet state
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchPets();
    }
  }, [user, authLoading, navigate]);

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data as Pet[]);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        color: pet.color || '',
        sex: pet.sex || 'macho',
        age_years: pet.age_years?.toString() || '',
        weight_kg: pet.weight_kg?.toString() || '',
        birthday: pet.birthday || '',
        important_notes: pet.important_notes || '',
      });
    } else {
      setEditingPet(null);
      setFormData(emptyPet);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Ingresa el nombre de tu mascota');
      return;
    }

    setIsSaving(true);

    try {
      const petData = {
        user_id: user!.id,
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        color: formData.color || null,
        sex: formData.sex,
        age_years: formData.age_years ? parseInt(formData.age_years) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        birthday: formData.birthday || null,
        important_notes: formData.important_notes || null,
      };

      if (editingPet) {
        const { error } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', editingPet.id);

        if (error) throw error;
        toast.success('Mascota actualizada');
        
        // Update selected pet if viewing detail
        if (selectedPet?.id === editingPet.id) {
          setSelectedPet({ ...selectedPet, ...petData } as Pet);
        }
      } else {
        const { error } = await supabase.from('pets').insert(petData);

        if (error) throw error;
        toast.success('Mascota registrada');
      }

      setIsDialogOpen(false);
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error);
      toast.error('Error al guardar. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (petId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta mascota?')) return;

    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId);

      if (error) throw error;
      toast.success('Mascota eliminada');
      
      // Close detail sheet if this pet was being viewed
      if (selectedPet?.id === petId) {
        setIsDetailOpen(false);
        setSelectedPet(null);
      }
      
      fetchPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.error('Error al eliminar. Intenta nuevamente.');
    }
  };

  const handleOpenDetail = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailOpen(true);
  };

  const handleEditFromDetail = (pet: Pet) => {
    setIsDetailOpen(false);
    handleOpenDialog(pet);
  };

  const getSpeciesEmoji = (species: PetSpecies) => {
    switch (species) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      default: return '🐾';
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Mis mascotas</h1>
          <Button variant="hero" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar mascota</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>

        {pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-avatar">
              <PawPrint className="h-12 w-12 text-lavender-dark" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">No tienes mascotas registradas</h2>
            <p className="mb-6 text-muted-foreground">
              Agrega a tu compañero peludo para personalizar su experiencia
            </p>
            <Button variant="hero" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Agregar mi primera mascota
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <div
                key={pet.id}
                onClick={() => handleOpenDetail(pet)}
                className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-avatar text-2xl sm:h-14 sm:w-14 sm:text-3xl">
                      {getSpeciesEmoji(pet.species)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-foreground sm:text-xl">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {SPECIES_LABELS[pet.species]} {pet.breed && `• ${pet.breed}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="hidden gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(pet);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={(e) => handleDelete(pet.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {pet.sex && (
                    <div>
                      <span className="text-muted-foreground">Sexo:</span>{' '}
                      <span className="text-foreground">{SEX_LABELS[pet.sex]}</span>
                    </div>
                  )}
                  {pet.age_years && (
                    <div>
                      <span className="text-muted-foreground">Edad:</span>{' '}
                      <span className="text-foreground">{pet.age_years} años</span>
                    </div>
                  )}
                  {pet.color && (
                    <div>
                      <span className="text-muted-foreground">Color:</span>{' '}
                      <span className="text-foreground">{pet.color}</span>
                    </div>
                  )}
                  {pet.weight_kg && (
                    <div>
                      <span className="text-muted-foreground">Peso:</span>{' '}
                      <span className="text-foreground">{pet.weight_kg} kg</span>
                    </div>
                  )}
                </div>

                {pet.important_notes && (
                  <p className="mt-3 line-clamp-2 text-sm italic text-muted-foreground">
                    "{pet.important_notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pet Detail Sheet */}
        <PetDetailSheet
          pet={selectedPet}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onEdit={handleEditFromDetail}
        />

        {/* Dialog for Add/Edit Pet */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPet ? 'Editar mascota' : 'Nueva mascota'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="¿Cómo se llama?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Especie *</Label>
                  <Select
                    value={formData.species}
                    onValueChange={(v) => setFormData({ ...formData, species: v as PetSpecies })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SPECIES_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(v) => setFormData({ ...formData, sex: v as PetSex })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEX_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Raza</Label>
                  <Input
                    id="breed"
                    placeholder="Ej: Persa"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="Ej: Naranja"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Edad (años)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="3"
                    value={formData.age_years}
                    onChange={(e) => setFormData({ ...formData, age_years: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="4.5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Cumpleaños</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas importantes</Label>
                <Textarea
                  id="notes"
                  placeholder="Alergias, condiciones especiales, etc."
                  value={formData.important_notes}
                  onChange={(e) => setFormData({ ...formData, important_notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="hero" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : editingPet ? 'Guardar cambios' : 'Registrar mascota'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
