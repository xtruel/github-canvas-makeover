import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  imageUrl?: string;
  author: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  published: boolean;
  tags?: string[];
}

export interface Comment {
  id?: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: Timestamp;
}

const ARTICLES_COLLECTION = 'articles';
const COMMENTS_COLLECTION = 'comments';

// Article CRUD operations
export const articleService = {
  // Get all published articles
  async getPublishedArticles(): Promise<Article[]> {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[];
  },

  // Get article by slug
  async getArticleBySlug(slug: string): Promise<Article | null> {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('slug', '==', slug)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Article;
  },

  // Get article by ID
  async getArticleById(id: string): Promise<Article | null> {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Article;
  },

  // Create new article
  async createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...articleData,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  // Update article
  async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete article
  async deleteArticle(id: string): Promise<void> {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Upload image
  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, `articles/${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // Delete image
  async deleteImage(imagePath: string): Promise<void> {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
  }
};

// Comment operations
export const commentService = {
  // Get comments for article
  async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
  },

  // Add comment
  async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};