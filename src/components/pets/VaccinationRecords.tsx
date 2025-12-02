import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VaccinationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Syringe, Calendar, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface VaccinationRecordsProps {
  petId: string;
  petName: string;
}

const emptyRecord = {
  vaccine_name: '',
  vaccination_date: '',
  next_due_date: '',
  notes: '',
};

export function VaccinationRecords({ petId, petName }: VaccinationRecordsProps) {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  const [formData, setFormData] = useState(emptyRecord);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [petId]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .select('*')
        .eq('pet_id', petId)
        .order('vaccination_date', { ascending: false });

      if (error) throw error;
      setRecords(data as VaccinationRecord[]);
    } catch (error) {
      console.error('Error fetching vaccination records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (record?: VaccinationRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        vaccine_name: record.vaccine_name,
        vaccination_date: record.vaccination_date,
        next_due_date: record.next_due_date || '',
        notes: record.notes || '',
      });
    } else {
      setEditingRecord(null);
      setFormData(emptyRecord);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.vaccine_name.trim()) {
      toast.error('Ingresa el nombre de la vacuna');
      return;
    }
    if (!formData.vaccination_date) {
      toast.error('Ingresa la fecha de vacunación');
      return;
    }

    setIsSaving(true);

    try {
      const recordData = {
        pet_id: petId,
        vaccine_name: formData.vaccine_name.trim(),
        vaccination_date: formData.vaccination_date,
        next_due_date: formData.next_due_date || null,
        notes: formData.notes.trim() || null,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('vaccination_records')
          .update(recordData)
          .eq('id', editingRecord.id);

        if (error) throw error;
        toast.success('Registro actualizado');
      } else {
        const { error } = await supabase.from('vaccination_records').insert(recordData);

        if (error) throw error;
        toast.success('Vacuna registrada');
      }

      setIsDialogOpen(false);
      fetchRecords();
    } catch (error) {
      console.error('Error saving vaccination record:', error);
      toast.error('Error al guardar. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de vacunación?')) return;

    try {
      const { error } = await supabase
        .from('vaccination_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      toast.success('Registro eliminado');
      fetchRecords();
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      toast.error('Error al eliminar. Intenta nuevamente.');
    }
  };

  const getStatusBadge = (nextDueDate: string | null) => {
    if (!nextDueDate) return null;

    const dueDate = parseISO(nextDueDate);
    const today = new Date();
    const soonThreshold = addDays(today, 30);

    if (isPast(dueDate)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3 w-3" />
          Vencida
        </span>
      );
    }

    if (isWithinInterval(dueDate, { start: today, end: soonThreshold })) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
          <Calendar className="h-3 w-3" />
          Próxima
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        Al día
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Syringe className="h-5 w-5 text-primary" />
          Vacunas
        </h3>
        <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <Syringe className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay vacunas registradas para {petName}
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-2"
            onClick={() => handleOpenDialog()}
          >
            Registrar primera vacuna
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {record.vaccine_name}
                    </h4>
                    {getStatusBadge(record.next_due_date)}
                  </div>
                  
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      Aplicada: {format(parseISO(record.vaccination_date), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    {record.next_due_date && (
                      <span>
                        Próxima: {format(parseISO(record.next_due_date), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    )}
                  </div>

                  {record.notes && (
                    <p className="mt-2 line-clamp-2 text-sm italic text-muted-foreground">
                      "{record.notes}"
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(record)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Editar vacuna' : 'Nueva vacuna'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vaccine_name">Nombre de la vacuna *</Label>
              <Input
                id="vaccine_name"
                placeholder="Ej: Rabia, Triple felina"
                value={formData.vaccine_name}
                onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccination_date">Fecha de aplicación *</Label>
              <Input
                id="vaccination_date"
                type="date"
                value={formData.vaccination_date}
                onChange={(e) => setFormData({ ...formData, vaccination_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Próxima dosis</Label>
              <Input
                id="next_due_date"
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Veterinario, reacciones, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="hero" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Guardando...' : editingRecord ? 'Guardar cambios' : 'Registrar vacuna'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
