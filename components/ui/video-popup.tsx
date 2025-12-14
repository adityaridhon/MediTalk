import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export default function HeroVideoDialogDemo() {
  return (
    <div className="relative">
      <HeroVideoDialog
        className="block dark:hidden"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/JdvyPmpqFHM?si=Y3rsSmjv1IYH8Jxu"
        thumbnailSrc="/assets/thumbnail.png"
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/JdvyPmpqFHM?si=Y3rsSmjv1IYH8Jxu"
        thumbnailSrc="/assets/thumbnail.png"
        thumbnailAlt="Hero Video"
      />
    </div>
  );
}
