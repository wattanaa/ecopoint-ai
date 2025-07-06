import { useState, useEffect, useCallback } from 'react';
import type * as CocoSsd from '@tensorflow-models/coco-ssd';
import { type DetectedObject } from '../types';

// Declare cocoSsd in the global scope for the script loaded from CDN
declare const cocoSsd: any;

export const useObjectDetection = () => {
  const [model, setModel] = useState<CocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Loading AI model...');
        const loadedModel: CocoSsd.ObjectDetection = await cocoSsd.load();
        setModel(loadedModel);
        console.log('AI model loaded successfully');
      } catch (error) {
        console.error('Error loading AI model:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const detectObjects = useCallback(async (video: HTMLVideoElement): Promise<DetectedObject[]> => {
    if (!model || !video || video.readyState !== 4) {
      return [];
    }
    try {
      const predictions = await model.detect(video);
      return predictions;
    } catch (error) {
      console.error("Detection error:", error);
      return [];
    }
  }, [model]);

  return { model, isLoading, detectObjects };
};