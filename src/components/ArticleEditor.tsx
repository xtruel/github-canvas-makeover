import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { articleService, Article } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

interface ArticleEditorProps {
  article?: Article;
  onSave?: (article: Article) => void;
  onCancel?: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({ 
  article, 
  onSave, 
  onCancel 
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    slug: article?.slug || '',
    published: article?.published || false,
    tags: article?.tags || []
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(article?.imageUrl || '');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!user || user.role !== 'ADMIN') {
      toast({
        title: "Errore",
        description: "Solo gli admin possono salvare articoli",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Errore",
        description: "Titolo e contenuto sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = imagePreview;
      
      // Upload image if a new one was selected
      if (imageFile) {
        const imagePath = `${Date.now()}-${imageFile.name}`;
        imageUrl = await articleService.uploadImage(imageFile, imagePath);
      }

      const articleData = {
        ...formData,
        imageUrl,
        author: user.displayName || user.email,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...'
      };

      if (article?.id) {
        // Update existing article
        await articleService.updateArticle(article.id, articleData);
        toast({
          title: "Successo",
          description: "Articolo aggiornato con successo"
        });
      } else {
        // Create new article
        const newId = await articleService.createArticle(articleData);
        toast({
          title: "Successo",
          description: "Articolo creato con successo"
        });
      }

      if (onSave) {
        onSave({ ...articleData, id: article?.id } as Article);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio dell'articolo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {article ? 'Modifica Articolo' : 'Nuovo Articolo'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titolo *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Inserisci il titolo dell'articolo"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="url-friendly-slug"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Estratto</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Breve descrizione dell'articolo (opzionale)"
            rows={3}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Contenuto *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Scrivi il contenuto dell'articolo"
            rows={10}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Immagine</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Seleziona Immagine
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs h-32 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tag</Label>
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Aggiungi tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              Aggiungi
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Published Switch */}
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
          />
          <Label htmlFor="published">Pubblica articolo</Label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salva Articolo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};