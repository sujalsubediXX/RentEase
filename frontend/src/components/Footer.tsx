const AMBER = "#d4922a";

interface FooterColumn {
  title: string;
  links: string[];
}

const footerColumns: FooterColumn[] = [
  { title: "Explore", links: ["Browse All Items", "Photography", "Outdoor & Camping", "Tools & Equipment", "Electronics", "Party & Events"] },
  { title: "Company", links: ["About Us", "How It Works", "List an Item", "Careers", "Blog", "Press"] },
  { title: "Support", links: ["Help Center", "Contact Us", "Trust & Safety", "Insurance", "Community"] },
];
const socialIcons: string[] = ["𝕏", "in", "f", "📸"];
const legalLinks: string[] = ["Privacy Policy", "Terms of Service", "Cookie Preferences"];


export const Footer = () => {
  return (
  
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-[5vw]">
        <div className="max-w-300 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-14 mb-12">
            <div>
              <div className="font-display text-[26px] font-medium tracking-wide text-gray-900 mb-3.5">
                Rent<span style={{ color: AMBER }}>Ease</span>
              </div>
              <p className="text-[13.5px] text-gray-400 leading-[1.7] max-w-70">
                The marketplace where you can rent or list almost anything — safely, affordably, and conveniently.
              </p>
              <div className="flex gap-2.5 mt-5">
                {socialIcons.map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[14px] text-gray-400 no-underline hover:border-amber-300 hover:text-amber-500 transition-all duration-200">
                    {s}
                  </a>
                ))}
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] text-amber-500 tracking-widest uppercase mb-4 font-medium">{col.title}</h4>
                <ul className="list-none space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
            <p className="text-[12.5px] text-gray-400">© {new Date().getFullYear()} RentEase Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-5">
              {legalLinks.map((l) => (
                <a key={l} href="#" className="text-[12.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
  )
}
