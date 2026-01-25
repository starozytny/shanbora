import { Card, CardContent } from '@shadcnComponents/ui/card';
import { cn } from '@shadcnComponents/lib/utils';
import { Check } from 'lucide-react';

export function PackageSelector({ templates, selectedId, onSelect, loading }) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                            <div className="h-8 bg-slate-200 rounded w-1/3 mt-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => {
                const isSelected = selectedId === template.id;

                return (
                    <Card
                        key={template.id}
                        className={cn(
                            'cursor-pointer transition-all hover:shadow-md relative',
                            isSelected && 'ring-2 ring-primary shadow-md'
                        )}
                        onClick={() => onSelect(template)}
                    >
                        {isSelected && (
                            <div className="absolute top-3 right-3 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                        )}
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-1">
                                {template.name}
                            </h3>
                            {template.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {template.description}
                                </p>
                            )}
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                <p>{template.defaultContent.duration}</p>
                                <p>{template.defaultContent.photos_count}</p>
                            </div>
                            <p className="text-2xl font-semibold">
                                {parseFloat(template.basePrice).toLocaleString('fr-FR')} €
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

export function PackageContentEditor({ content, onChange }) {
    const updateField = (field, value) => {
        onChange({ ...content, [field]: value });
    };

    const updateListItem = (field, index, value) => {
        const list = [...(content[field] || [])];
        list[index] = value;
        onChange({ ...content, [field]: list });
    };

    const addListItem = (field) => {
        const list = [...(content[field] || []), ''];
        onChange({ ...content, [field]: list });
    };

    const removeListItem = (field, index) => {
        const list = [...(content[field] || [])];
        list.splice(index, 1);
        onChange({ ...content, [field]: list });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-medium mb-1.5 block">
                        Durée
                    </label>
                    <input
                        type="text"
                        value={content.duration || ''}
                        onChange={(e) => updateField('duration', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Ex: 10 heures de couverture"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block">
                        Nombre de photos
                    </label>
                    <input
                        type="text"
                        value={content.photos_count || ''}
                        onChange={(e) => updateField('photos_count', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Ex: 450+ photos retouchées"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block">
                        Livraison
                    </label>
                    <input
                        type="text"
                        value={content.delivery || ''}
                        onChange={(e) => updateField('delivery', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Ex: Galerie privée en ligne"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block">
                        Délai de livraison
                    </label>
                    <input
                        type="text"
                        value={content.delivery_time || ''}
                        onChange={(e) => updateField('delivery_time', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Ex: Livraison sous 4 semaines"
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Inclusions</label>
                    <button
                        type="button"
                        onClick={() => addListItem('inclusions')}
                        className="text-sm text-primary hover:underline"
                    >
                        + Ajouter
                    </button>
                </div>
                <div className="space-y-2">
                    {(content.inclusions || []).map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateListItem('inclusions', index, e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-md text-sm"
                                placeholder="Ex: Cérémonie"
                            />
                            <button
                                type="button"
                                onClick={() => removeListItem('inclusions', index)}
                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Bonus / Extras</label>
                    <button
                        type="button"
                        onClick={() => addListItem('extras')}
                        className="text-sm text-primary hover:underline"
                    >
                        + Ajouter
                    </button>
                </div>
                <div className="space-y-2">
                    {(content.extras || []).map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateListItem('extras', index, e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-md text-sm"
                                placeholder="Ex: Album photo 30x30"
                            />
                            <button
                                type="button"
                                onClick={() => removeListItem('extras', index)}
                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
