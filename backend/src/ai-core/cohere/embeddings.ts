import { cohereService } from './client';

export interface EmbeddingResult {
  text: string;
  embedding: number[];
}

export class CohereEmbeddings {
  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      const response = await cohereService.getClient().embed({
        texts,
        model: cohereService.getEmbedModel(),
        inputType: 'search_document',
      });

      return texts.map((text, index) => ({
        text,
        embedding: response.embeddings[index],
      }));
    } catch (error) {
      console.error('Embedding error:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  async embedSingle(text: string, inputType: 'search_document' | 'search_query' | 'classification' = 'search_document'): Promise<number[]> {
    try {
      const response = await cohereService.getClient().embed({
        texts: [text],
        model: cohereService.getEmbedModel(),
        inputType,
      });

      return response.embeddings[0];
    } catch (error) {
      throw new Error('Failed to generate embedding');
    }
  }

  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async findSimilar(
    query: string,
    documents: string[],
    topK: number = 5
  ): Promise<Array<{ text: string; similarity: number; index: number }>> {
    const queryEmbedding = await this.embedSingle(query, 'search_query');
    const docEmbeddings = await this.embed(documents);

    const similarities = docEmbeddings.map((doc, index) => ({
      text: doc.text,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
      index,
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

export const cohereEmbeddings = new CohereEmbeddings();
