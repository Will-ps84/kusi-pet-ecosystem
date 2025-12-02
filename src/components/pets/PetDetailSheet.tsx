import { Pet, SPECIES_LABELS, SEX_LABELS, PetSpecies } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit2, Calendar, Scale, Palette } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VaccinationRecords } from './VaccinationRecords';
import { PetPhotos } from './PetPhotos';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PetDetailSheetProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (pet: Pet) => void;
}

export function PetDetailSheet({ pet, isOpen, onClose, onEdit }: PetDetailSheetProps) {
  if (!pet) return null;

  const getSpeciesEmoji = (species: PetSpecies) => {
    switch (species) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      default: return '🐾';
    }
  };

  const formatBirthday = (birthday: string) => {
    try {
      return format(parseISO(birthday), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return birthday;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-avatar text-3xl">
                {getSpeciesEmoji(pet.species)}
              </div>
              <div>
                <SheetTitle className="text-left text-xl">{pet.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {SPECIES_LABELS[pet.species]} {pet.breed && `• ${pet.breed}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(pet)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="vaccines">Vacunas</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            {/* Pet Info */}
            <div className="grid grid-cols-2 gap-3">
              {pet.sex && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Sexo</p>
                  <p className="font-medium text-foreground">{SEX_LABELS[pet.sex]}</p>
                </div>
              )}
              {pet.age_years && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Edad</p>
                  <p className="font-medium text-foreground">{pet.age_years} años</p>
                </div>
              )}
              {pet.weight_kg && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Scale className="h-3 w-3" /> Peso
                  </p>
                  <p className="font-medium text-foreground">{pet.weight_kg} kg</p>
                </div>
              )}
              {pet.color && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Palette className="h-3 w-3" /> Color
                  </p>
                  <p className="font-medium text-foreground">{pet.color}</p>
                </div>
              )}
              {pet.birthday && (
                <div className="col-span-2 rounded-lg bg-muted/50 p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Cumpleaños
                  </p>
                  <p className="font-medium text-foreground">{formatBirthday(pet.birthday)}</p>
                </div>
              )}
            </div>

            {pet.important_notes && (
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs font-medium text-muted-foreground">Notas importantes</p>
                <p className="mt-1 text-sm text-foreground">{pet.important_notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vaccines" className="mt-4">
            <VaccinationRecords petId={pet.id} petName={pet.name} />
          </TabsContent>

          <TabsContent value="photos" className="mt-4">
            <PetPhotos petId={pet.id} petName={pet.name} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
