import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { 
  Upload as UploadIcon, 
  Image, 
  Video, 
  FileText, 
  X, 
  Eye,
  Tag,
  Send,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { uploadMedia } from "@/lib/api/media";
import { createPost } from "@/lib/api/posts";

const Upload = () => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<"text" | "image" | "video">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return;
    }
    
    if (postType === "text" && !content.trim()) {
      toast.error("Il contenuto è obbligatorio per i post di testo");
      return;
    }
    
    if ((postType === "image" || postType === "video") && selectedFiles.length === 0) {
      toast.error(`Seleziona almeno un ${postType === "image" ? "immagine" : "video"}`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let mediaId: string | undefined;
      
      // Upload media if files are selected
      if (selectedFiles.length > 0) {
        toast.loading("Caricamento file in corso...", { id: "upload-progress" });
        
        // For now, upload only the first file
        const file = selectedFiles[0];
        const mediaAsset = await uploadMedia(file);
        mediaId = mediaAsset.id;
        
        toast.success("File caricato con successo!", { id: "upload-progress" });
      }
      
      // Create the post
      toast.loading("Pubblicazione post in corso...", { id: "create-post" });
      
      const postData = {
        type: postType.toUpperCase() as 'TEXT' | 'IMAGE' | 'VIDEO',
        title: title.trim(),
        body: content.trim() || undefined,
        mediaId
      };
      
      await createPost(postData);
      
      toast.success("Post pubblicato con successo! 🎉", { id: "create-post" });
      
      // Reset form
      setTitle("");
      setContent("");
      setSelectedFiles([]);
      setTags([]);
      setShowPreview(false);
      
      // Redirect to forum after a short delay
      setTimeout(() => {
        navigate("/forum");
      }, 1500);
      
    } catch (error: unknown) {
      console.error("Errore durante la pubblicazione:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore durante la pubblicazione del post";
      toast.error(errorMessage, {
        id: "upload-progress"
      });
      toast.dismiss("create-post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const isFormValid = title.trim().length > 0 && 
    (postType === "text" ? content.trim().length > 0 : selectedFiles.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-roma-gold mb-2">
          Crea Nuovo Post
        </h1>
        <p className="text-muted-foreground">
          Condividi i tuoi contenuti con la community romanista
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Type Selection */}
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Tipo di Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={postType === "text" ? "default" : "outline"}
                  onClick={() => setPostType("text")}
                  className={postType === "text" ? "bg-roma-gold text-black hover:bg-roma-yellow" : ""}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Testo
                </Button>
                <Button
                  variant={postType === "image" ? "default" : "outline"}
                  onClick={() => setPostType("image")}
                  className={postType === "image" ? "bg-roma-gold text-black hover:bg-roma-yellow" : ""}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Immagini
                </Button>
                <Button
                  variant={postType === "video" ? "default" : "outline"}
                  onClick={() => setPostType("video")}
                  className={postType === "video" ? "bg-roma-gold text-black hover:bg-roma-yellow" : ""}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Title */}
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Titolo</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Inserisci un titolo accattivante per il tuo post..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {title.length}/300 caratteri
              </p>
            </CardContent>
          </Card>

          {/* Content based on type */}
          {postType === "text" && (
            <Card className="shadow-glow border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Contenuto</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Scrivi il tuo messaggio qui... Condividi le tue opinioni, analisi o esperienze!"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-32 w-full resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {content.length}/2000 caratteri
                </p>
              </CardContent>
            </Card>
          )}

          {(postType === "image" || postType === "video") && (
            <Card className="shadow-glow border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Carica {postType === "image" ? "Immagini" : "Video"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Trascina i file qui o clicca per selezionare
                  </p>
                  <input
                    type="file"
                    accept={postType === "image" ? "image/*" : "video/*"}
                    multiple={postType === "image"}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Seleziona File
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {postType === "image" 
                      ? "JPG, PNG, GIF fino a 10MB" 
                      : "MP4, AVI, MOV fino a 50MB"
                    }
                  </p>
                </div>

                {/* File Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        {postType === "image" && getFilePreview(file) && (
                          <img 
                            src={getFilePreview(file)!} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        {postType === "video" && (
                          <div className="w-16 h-16 bg-black/20 rounded flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Description for Media */}
                <div className="mt-4">
                  <Textarea
                    placeholder="Aggiungi una descrizione opzionale..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-20 w-full resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {content.length}/500 caratteri
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Aggiungi tag (es: Derby, Totti, Tattiche)..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} variant="outline">
                  Aggiungi
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Anteprima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full mb-4"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Nascondi" : "Mostra"} Anteprima
              </Button>
              
              {showPreview && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">
                    {title || "Titolo del post..."}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {content || "Contenuto del post..."}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Linee Guida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Sii rispettoso verso altri tifosi
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Condividi contenuti originali
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Usa tag appropriati
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Evita spam e contenuti off-topic
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="shadow-roma border-border/50">
            <CardContent className="p-4">
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-roma-gold hover:bg-roma-yellow text-black font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2" />
                    Pubblicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Pubblica Post
                  </>
                )}
              </Button>
              {!isFormValid && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Completa tutti i campi richiesti per pubblicare
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;