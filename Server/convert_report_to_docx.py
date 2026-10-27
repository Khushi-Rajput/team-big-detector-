import os
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_report_docx(md_path, docx_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    doc = docx.Document()
    
    # Configure default style (Times New Roman, 12pt)
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.25
    normal_style.paragraph_format.space_after = Pt(6)

    # Set 1 inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)
        section.right_margin = Inches(1.0)

    lines = md_text.split('\n')
    i = 0
    in_code_block = False
    code_lang = ''
    code_lines = []

    while i < len(lines):
        line = lines[i]

        # Check for code / mermaid blocks
        if line.strip().startswith('```'):
            if in_code_block:
                # End of block
                block_content = '\n'.join(code_lines)
                table = doc.add_table(rows=1, cols=1)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = table.cell(0, 0)
                set_cell_background(cell, "F4F6F9" if code_lang != "mermaid" else "F0F7FF")
                set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
                
                header_p = cell.paragraphs[0]
                header_p.paragraph_format.space_after = Pt(4)
                hrun = header_p.add_run(f"[{'UML / ARCHITECTURE DIAGRAM SPECIFICATION (Mermaid)' if code_lang == 'mermaid' else 'SOURCE CODE / SPECIFICATION'}]")
                hrun.bold = True
                hrun.font.size = Pt(9.5)
                hrun.font.color.rgb = RGBColor(30, 64, 175)

                body_p = cell.add_paragraph()
                body_p.paragraph_format.space_after = Pt(0)
                body_p.paragraph_format.line_spacing = 1.05
                brun = body_p.add_run(block_content)
                brun.font.name = 'Consolas'
                brun.font.size = Pt(8.5)
                brun.font.color.rgb = RGBColor(33, 37, 41)

                doc.add_paragraph().paragraph_format.space_after = Pt(6)

                in_code_block = False
                code_lines = []
                code_lang = ''
                i += 1
                continue
            else:
                in_code_block = True
                code_lang = line.strip()[3:].strip().lower()
                code_lines = []
                i += 1
                continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Check for markdown table
        if line.strip().startswith('|') and '|' in line.strip()[1:]:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            
            # Parse table
            raw_rows = []
            for tl in table_lines:
                # check if separator row like |--|--|
                clean = tl.strip('|').strip()
                if re.match(r'^[\s\-:|]+$', clean):
                    continue
                cells = [c.strip() for c in tl.split('|')[1:-1]]
                if cells:
                    raw_rows.append(cells)
            
            if raw_rows:
                num_cols = max(len(r) for r in raw_rows)
                t = doc.add_table(rows=len(raw_rows), cols=num_cols)
                t.alignment = WD_TABLE_ALIGNMENT.CENTER
                for r_idx, row_data in enumerate(raw_rows):
                    for c_idx in range(num_cols):
                        val = row_data[c_idx] if c_idx < len(row_data) else ''
                        cell = t.cell(r_idx, c_idx)
                        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                        cp = cell.paragraphs[0]
                        cp.paragraph_format.space_after = Pt(2)
                        cp.paragraph_format.line_spacing = 1.15
                        crun = cp.add_run(val.replace('**', '').replace('`', ''))
                        crun.font.name = 'Times New Roman'
                        if r_idx == 0:
                            set_cell_background(cell, "E2E8F0")
                            crun.bold = True
                            crun.font.size = Pt(10)
                        else:
                            if r_idx % 2 == 1:
                                set_cell_background(cell, "F8FAFC")
                            crun.font.size = Pt(9.5)
                doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue

        stripped = line.strip()

        # Page breaks
        if stripped == '---':
            doc.add_page_break()
            i += 1
            continue

        # Heading 1
        if stripped.startswith('# '):
            text = stripped[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text.replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(16)
            run.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42)
            if 'CHAPTER' in text.upper() or 'CERTIFICATE' in text.upper() or 'TABLE OF CONTENTS' in text.upper() or 'ABSTRACT' in text.upper():
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            i += 1
            continue

        # Heading 2
        if stripped.startswith('## '):
            text = stripped[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text.replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(13.5)
            run.bold = True
            run.font.color.rgb = RGBColor(30, 41, 59)
            i += 1
            continue

        # Heading 3
        if stripped.startswith('### '):
            text = stripped[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text.replace('**', ''))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12)
            run.bold = True
            run.font.color.rgb = RGBColor(51, 65, 85)
            i += 1
            continue

        # Bullet list
        if stripped.startswith('* ') or stripped.startswith('- '):
            bullet_text = stripped[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            # parse bold segments
            parts = re.split(r'(\*\*.*?\*\*)', bullet_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                else:
                    r = p.add_run(part.replace('`', ''))
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11)
            i += 1
            continue

        # Numbered list
        num_match = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if num_match:
            num = num_match.group(1)
            item_text = num_match.group(2)
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            parts = re.split(r'(\*\*.*?\*\*)', item_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                else:
                    r = p.add_run(part.replace('`', ''))
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11)
            i += 1
            continue

        # Regular paragraph
        if stripped:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.25
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

            parts = re.split(r'(\*\*.*?\*\*)', stripped)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                else:
                    r = p.add_run(part.replace('`', ''))
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11.5)
        
        i += 1

    doc.save(docx_path)
    print(f"Successfully generated DOCX report at: {docx_path}")

if __name__ == '__main__':
    md_file = os.path.abspath('PROJECT_REPORT.md')
    docx_file = os.path.abspath('PROJECT_REPORT.docx')
    create_report_docx(md_file, docx_file)
