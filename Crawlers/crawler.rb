require 'nokogiri'
require 'open-uri'

def fetch_amazon_data(site, headers)
  doc = Nokogiri::HTML(URI.open(site, headers= headers))
  components = doc.css('[data-csa-c-type="item"]')
  smartphones = []

  components.first(5).each_with_index do |component, index|
    obj = {}
    puts "Loading #{index + 1} component info... \n"
    item_name_node = component.at("[data-cy='title-recipe']")
    item_price_symbol = component.at(".a-price-symbol")
    item_price_whole = component.at(".a-price-whole")
    item_price_fraction = component.at(".a-price-fraction")
    item_reviews_count = component.at("[data-csa-c-content-id='alf-customer-ratings-count-component']")&.text.strip

    bought_last_month_element = component.at(".a-row.a-size-base:contains('bought in past month')")
    item_bought_last_month = bought_last_month_element&.text&.match(/\d+K+/)&.to_s || "Not found info"

    item_name = item_name_node ? item_name_node.text.strip[0, 75] : "N/A"
    item_name += '...' if item_name_node && item_name_node.text.length > 75

    if item_price_symbol && item_price_whole && item_price_fraction
      item_price = "#{item_price_symbol&.text.strip}#{item_price_whole&.text.strip}#{item_price_fraction&.text.strip}"
    else
      item_price = "N/A"
    end

    href_link = component.at("a")&.attr("href")

    obj[:name] = item_name
    obj[:price] = item_price
    obj[:reviews_count] = item_reviews_count
    obj[:bought_last_month] = item_bought_last_month
    obj[:href_link] = href_link
    obj[:additional_data] = {}

    if href_link
      subpage_url = "https://www.amazon.com#{href_link}"
      subpage_doc = Nokogiri::HTML(URI.open(subpage_url, headers=headers))
      puts "Loading subpage info... \n"
      brand = subpage_doc.at(".po-brand .a-span9")&.text&.strip
      compatible_devices = subpage_doc.at(".po-compatible_devices .a-span9")&.text&.strip
      color = subpage_doc.at(".po-color .a-span9")&.text&.strip
      obj[:additional_data][:brand] = brand.nil? ? 'N/A' : brand
      obj[:additional_data][:compatible_devices] = compatible_devices.nil? ? 'N/A' : compatible_devices
      obj[:additional_data][:color] = color.nil? ? 'N/A' : color
    end

    smartphones << obj
  end

  smartphones
end

user_agents = [
  "Mozilla/5.0 (Linux; Android 10; 9032W Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 Mobile Safari/537.36",
  "Dalvik/1.6.0 (Linux; U; Android 4.4.2; W7 Build/KOT49H)",
  "TuneIn Radio/26.0.0; iPhone13%2C3; iOS/16.5.1",
  "TuneIn Radio/26.0.0; iPhone14%2C6; iOS/16.5.1",
  "TuneIn Radio/26.0.0; iPad13%2C16; iPadOS/16.5.1",
  "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12.0; Build/STTE.230319.008.H1) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/92.0.4515.159 Safari/537.36 CrKey/1.56.500000 DeviceType/AndroidTV",
  "Mozilla/5.0 (Linux; 11; VOG-TL00) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML%2C like Gecko) GSA/273.0.547966426 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; SM-A127M Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/424.0.0.21.75;]"
]
random_user_agent = user_agents.sample
headers = {
  'User-Agent' => random_user_agent,
  'Referer' => 'https://www.google.com/',
  'Content-Type' => 'text/html',
  'Accept-Language' => 'en-US,en;q=0.5',
}

site = "https://www.amazon.com/s?i=specialty-aps&bbn=16225009011&rh=n%3A%2116225009011%2Cn%3A2811119011&ref=nav_em__nav_desktop_sa_intl_cell_phones_and_accessories_0_2_5_5"
href_links = []

smartphones_data = fetch_amazon_data(site, headers)
smartphones_data.each_with_index do |smartphone, index|
  puts "#{index + 1}.\nName: \t\t\t#{smartphone[:name]}\nPrice: \t\t\t#{smartphone[:price]}\nNumber of reviews: \t#{smartphone[:reviews_count]}\nBought last month: \t#{smartphone[:bought_last_month]}\n\n"
  puts "Additional subpage info =========\n"
  puts "Brand: \t\t\t#{smartphone[:additional_data][:brand]}\n"
  puts "Comptatible Devices: \t#{smartphone[:additional_data][:compatible_devices]}\n"
  puts "Color \t\t\t#{smartphone[:additional_data][:color]}\n\n"
  href_links+= [smartphone[:href_link]]
end

File.open("href_links.txt", "w") { |file| file.puts(href_links.join("\n")) }