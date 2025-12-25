import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Zap, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockPolicies } from "@/data/mockPolicies";
import { toast } from "@/hooks/use-toast";
const ScanPage = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Photo uploaded",
        description: "Analyzing headline...",
      });
      
      // Trigger scanning after upload
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
      setIsScanning(true);
      setScanProgress(0);

      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const randomPolicy = mockPolicies[Math.floor(Math.random() * mockPolicies.length)];
            setTimeout(() => navigate(`/result/${randomPolicy.id}`), 200);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
  };

  const handleCapture = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to a random policy result
          const randomPolicy = mockPolicies[Math.floor(Math.random() * mockPolicies.length)];
          setTimeout(() => navigate(`/result/${randomPolicy.id}`), 200);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Flash Effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-primary-foreground hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>
        <span className="text-sm font-medium">Scan Headline</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Camera Viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Simulated camera background */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground/95 to-foreground" />

        {/* Viewfinder Frame */}
        <div className="relative w-[85%] max-w-md aspect-[4/3]">
          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary-foreground" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary-foreground" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary-foreground" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary-foreground" />

          {/* Scanning beam */}
          {isScanning && (
            <motion.div
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-chart-2/50 to-transparent"
            />
          )}

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {!isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Point at any news headline</p>
                <p className="text-sm opacity-60">
                  Center the headline in the frame
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Zap className="w-12 h-12 mx-auto animate-pulse text-chart-2" />
                <p className="text-lg font-medium">Analyzing policy...</p>
                <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    className="h-full bg-chart-2"
                  />
                </div>
                <p className="text-sm opacity-60">
                  Calculating personal impact
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12">
        <div className="flex items-center justify-center gap-8">
          {/* Upload Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleUploadClick}
            disabled={isScanning}
            className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm disabled:opacity-50"
          >
            <Upload className="w-6 h-6 text-primary-foreground" />
          </motion.button>

          {/* Capture Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            disabled={isScanning}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full border-4 border-foreground" />
          </motion.button>

          {/* Spacer for symmetry */}
          <div className="w-14 h-14" />
        </div>

        {/* Demo hint */}
        <p className="text-center text-sm opacity-40 mt-6">
          Tap capture or upload a photo of a headline
        </p>
      </div>
    </div>
  );
};

export default ScanPage;
