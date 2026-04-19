// Login page-specific layout
export default function LoginLayout({ children }) {
  // এখানে তুমি RootLayout use করছো না, তাই fullscreen sidebar/background apply হবে না
  return (
    <div>
      {children}
    </div>
  );
}
