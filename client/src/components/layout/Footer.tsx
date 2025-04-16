const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Press</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">How It Works</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Search Cars</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Sell Car</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Loan Calculator</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Dealerships</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Marketplace</a></li>
            </ul>
          </div>

          {/* Our Brands */}
          <div>
            <h3 className="font-semibold mb-4">Our Brands</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Tesla</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">BMW</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Audi</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Ford</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Toyota</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Lexus</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Mercedes</a></li>
            </ul>
          </div>

          {/* Vehicle Type */}
          <div>
            <h3 className="font-semibold mb-4">Vehicle Type</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Sedan</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">SUV</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Coupe</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Hatchback</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Pickup</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Wagon</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Van</a></li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-3 mb-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold text-blue-500 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-1">
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875V15z" />
                <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75z" />
                <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z" />
              </svg>
              JOIN D-CARS
            </div>
            <p className="text-muted-foreground text-sm">The most efficient way to buy and sell cars</p>
          </div>

          <div className="flex items-center gap-2">
            <a href="#" className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium">Contact Dealer</a>
            <a href="#" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">Sign up</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-xs text-muted-foreground text-center md:flex justify-between">
          <div>© 2023 D-CARS Inc. All rights reserved.</div>
          <div className="mt-2 md:mt-0">
            <a href="#" className="hover:text-foreground">Terms & Conditions</a> {" • "}
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
