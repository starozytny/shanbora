import { Card, CardContent } from '@shadcnComponents/ui/card';
import { cn } from '@shadcnComponents/lib/utils';
import { Check, Camera, Clock, Image, MapPin } from 'lucide-react';

const COLLECTION_BADGES = {
    'half_day': 'Collection N°1',
    'full_day': 'Collection N°2',
    'premium': 'Collection N°3',
};

export function PackageSelector({ templates, selectedId, onSelect, loading }) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-5 bg-slate-200 rounded w-24 mb-4" />
                            <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
                            <div className="space-y-2 mb-4">
                                <div className="h-3 bg-slate-200 rounded w-full" />
                                <div className="h-3 bg-slate-200 rounded w-5/6" />
                            </div>
                            <div className="h-8 bg-slate-200 rounded w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template, index) => {
                const isSelected = selectedId === template.id;
                const badge = COLLECTION_BADGES[template.slug] || `Formule ${index + 1}`;

                return (
                    <Card
                        key={template.id}
                        className={cn(
                            'cursor-pointer transition-all hover:shadow-lg relative overflow-hidden',
                            isSelected && 'ring-2 ring-primary shadow-lg'
                        )}
                        onClick={() => onSelect(template)}
                    >
                        {/* Badge */}
                        <div className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 tracking-wider uppercase">
                            {badge}
                        </div>

                        {/* Checkmark */}
                        {isSelected && (
                            <div className="absolute top-10 right-3 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                        )}

                        <CardContent className="p-5">
                            {/* Header */}
                            <div className="flex justify-between items-baseline border-b pb-4 mb-4">
                                <h3 className="font-medium text-lg">
                                    {template.name}
                                </h3>
                                <p className="text-2xl font-semibold">
                                    {parseFloat(template.basePrice).toLocaleString('fr-FR')}
                                    <span className="text-base text-muted-foreground ml-0.5">€</span>
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 text-sm">
                                {template.defaultContent.duration && (
                                    <div className="flex items-start gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                            {template.defaultContent.duration}
                                        </span>
                                    </div>
                                )}
                                {template.defaultContent.photos_count && (
                                    <div className="flex items-start gap-2">
                                        <Image className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                            {template.defaultContent.photos_count}
                                        </span>
                                    </div>
                                )}
                                {template.defaultContent.inclusions?.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                                            Inclus
                                        </p>
                                        <ul className="space-y-1">
                                            {template.defaultContent.inclusions.slice(0, 3).map((item, i) => (
                                                <li key={i} className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Check className="h-3 w-3 text-green-600" />
                                                    <span className="text-xs">{item}</span>
                                                </li>
                                            ))}
                                            {template.defaultContent.inclusions.length > 3 && (
                                                <li className="text-xs text-muted-foreground pl-4">
                                                    + {template.defaultContent.inclusions.length - 3} autres...
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
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
                        placeholder="Ex: 8 heures de couverture"
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
                        placeholder="Ex: 450 à 500 images HD retouchées"
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
                    <label className="text-sm font-medium">Ce qui est inclus</label>
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
                                placeholder="Ex: Séance couple dédiée 20-30 min"
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
                    {(content.inclusions || []).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            Aucune inclusion. Cliquez sur "+ Ajouter" pour en créer.
                        </p>
                    )}
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
                    {(content.extras || []).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            Aucun bonus. Cliquez sur "+ Ajouter" pour en créer.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
