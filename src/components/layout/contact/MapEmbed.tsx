export function MapEmbed() {
  return (
    <div className="w-full aspect-[4/3] rounded-[8px] overflow-hidden">
      <iframe
        src="https://maps.google.com/maps?q=Kfar+Yavetz&t=&z=15&ie=UTF8&iwloc=&output=embed"
        title="מיקום הקליניקה"
        className="w-full h-full border-0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  );
}
