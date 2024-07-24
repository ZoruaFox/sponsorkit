import cairosvg

def svg_to_png(svg_file_path, png_file_path):
    cairosvg.svg2png(url=svg_file_path, write_to=png_file_path, dpi=300, encoding='utf-8')  # Specify the encoding as 'utf-8' when writing to the PNG file.

svg_path = '/home/runner/work/sponsorkit/sponsorkit/sponsorkit/sponsors.svg'
png_path = '/home/runner/work/sponsorkit/sponsorkit/sponsorkit/sponsors.png'
svg_to_png(svg_path, png_path)
