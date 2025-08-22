
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Upload, Download, Ratio, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ImageResizerPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (e.g., JPG, PNG, WEBP).');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setWidth(String(img.width));
          setHeight(String(img.height));
          setOriginalImage(e.target?.result as string);
          setResizedImage(null);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value;
    setWidth(newWidth);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      const newHeight = Math.round(Number(newWidth) * aspectRatio);
      setHeight(String(newHeight));
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value;
    setHeight(newHeight);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      const newWidth = Math.round(Number(newHeight) * aspectRatio);
      setWidth(String(newWidth));
    }
  };

  const handleResize = () => {
    if (!originalImage || !width || !height) {
      setError('Please upload an image and specify dimensions.');
      return;
    }
    setError(null);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not process the image. Please try again.');
        return;
      }
      canvas.width = Number(width);
      canvas.height = Number(height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const resizedDataUrl = canvas.toDataURL('image/png');
      setResizedImage(resizedDataUrl);
    };
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Image Resizer</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Client-Side Image Resizer</CardTitle>
              <CardDescription>
                Resize your images securely in your browser. No files are ever uploaded to a server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button onClick={triggerFileUpload} className="w-full">
                    <Upload className="mr-2" /> Upload Image
                  </Button>
                  {originalImage && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width">Width (px)</Label>
                          <Input id="width" type="number" value={width} onChange={handleWidthChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (px)</Label>
                          <Input id="height" type="number" value={height} onChange={handleHeightChange} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="aspect-ratio"
                          checked={maintainAspectRatio}
                          onCheckedChange={setMaintainAspectRatio}
                        />
                        <Label htmlFor="aspect-ratio" className="flex items-center gap-2">
                          <Ratio className="size-4" /> Maintain Aspect Ratio
                        </Label>
                      </div>
                      <Button onClick={handleResize} className="w-full">Resize Image</Button>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-center font-medium">Original</h3>
                      {originalImage ? (
                        <img src={originalImage} alt="Original" className="rounded-lg border object-contain" />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed">
                          <p className="text-muted-foreground">Upload an image to start</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-center font-medium">Resized</h3>
                      {resizedImage ? (
                        <img src={resizedImage} alt="Resized" className="rounded-lg border object-contain" />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed">
                          <p className="text-muted-foreground">Resized image will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {resizedImage && (
                    <Button asChild className="w-full">
                      <a href={resizedImage} download="resized-image.png">
                        <Download className="mr-2" /> Download Resized Image
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is this tool free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes, this image resizer is completely free. There are no hidden costs or limitations on the number of images you can resize.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is my data secure and private?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. Your privacy is our top priority. The entire resizing process happens directly in your web browser. Your images are never uploaded to our server or any third-party service, ensuring your data remains completely private and secure on your device.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What image formats are supported?</AccordionTrigger>
                  <AccordionContent>
                    This tool supports all common image formats that your browser can open, including JPEG, PNG, WEBP, GIF, and BMP. The resized image will be available for download as a PNG file to preserve transparency and quality.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What does "Maintain Aspect Ratio" do?</AccordionTrigger>
                  <AccordionContent>
                    Maintaining the aspect ratio ensures that your image is not stretched or distorted when resized. When this option is checked, changing the width will automatically update the height (and vice-versa) to keep the image's original proportions.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is there a limit to the image file size?</AccordionTrigger>
                  <AccordionContent>
                    There is no hard limit imposed by the tool itself, but performance may vary depending on your computer's memory and processing power. Very large images (e.g., over 20MB) may cause your browser to slow down during processing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
