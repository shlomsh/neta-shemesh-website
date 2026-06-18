const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const contextDesktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  
  const checkViewport = async (context, name, isMobile) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    // wait for layout to settle and animations to unpause
    await page.waitForTimeout(1000); 
    
    console.log(`\n--- QA Results for ${name} ---`);
    
    // Scroll to the Expertise section
    await page.evaluate(() => {
      const expertise = document.getElementById('expertise');
      if (expertise) {
        expertise.scrollIntoView();
      }
    });
    await page.waitForTimeout(500); // Wait for scroll animation and reveal
    
    // Take screenshot
    await page.screenshot({ path: `qa_${name}.png`, fullPage: false });

    // 1. Card count
    const cards = await page.$$eval('#expertise-cards-grid > div', els => els.length);
    console.log(`Card count (Expected 4): ${cards === 4 ? 'PASS' : 'FAIL'} - found ${cards}`);
    
    // 2. Grid Layout & 3. Full-width stretch
    const gridStyles = await page.evaluate(() => {
      const grid = document.getElementById('expertise-cards-grid');
      if (!grid) return null;
      const computed = window.getComputedStyle(grid);
      const parentWidth = grid.parentElement.clientWidth;
      const gridWidth = grid.clientWidth;
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        parentWidth,
        gridWidth
      };
    });
    
    if (gridStyles) {
      const cols = gridStyles.gridTemplateColumns.split(' ').length;
      if (isMobile) {
        console.log(`Layout (Mobile): Found ${cols} columns - gridTemplateColumns: ${gridStyles.gridTemplateColumns}`);
      } else {
        console.log(`Layout (Desktop Expected 2 cols): ${cols === 2 ? 'PASS' : 'FAIL'} - found ${cols} columns`);
      }
      const isFullWidth = (gridStyles.gridWidth >= gridStyles.parentWidth * 0.95);
      console.log(`Full-width stretch (Expected Yes): ${isFullWidth ? 'PASS' : 'FAIL'} - Grid width ${gridStyles.gridWidth}px, Parent width ${gridStyles.parentWidth}px`);
    } else {
      console.log('FAIL - #expertise-cards-grid not found');
    }
    
    // 4. Text color & 7. Pill overlay visible
    const pillCheck = await page.evaluate(() => {
      // Assuming #PdbLfACdCMxc8hQc is the first card's text according to the user's instructions
      // Or we can check the pill elements.
      const firstCardText = document.querySelector('#PdbLfACdCMxc8hQc');
      if (!firstCardText) return { found: false };
      
      const computed = window.getComputedStyle(firstCardText);
      return {
        found: true,
        color: computed.color,
        text: firstCardText.innerText
      };
    });
    
    if (pillCheck.found) {
      // Checking if color is white. Usually white is rgb(255, 255, 255).
      const isDark = pillCheck.color !== 'rgb(255, 255, 255)' && pillCheck.color !== 'rgba(255, 255, 255, 1)';
      console.log(`Text color dark (Expected true): ${isDark ? 'PASS' : 'FAIL'} - color is ${pillCheck.color}`);
    } else {
      console.log('FAIL - #PdbLfACdCMxc8hQc not found');
    }
    
    // 5. Section header
    const headerVisible = await page.evaluate(() => {
      // Find element containing "מרחב בטוח"
      const headers = Array.from(document.querySelectorAll('*')).filter(el => el.textContent.includes('מרחב בטוח לקשר שלכם'));
      for (const el of headers) {
        if (window.getComputedStyle(el).display !== 'none' && el.offsetParent !== null) {
          return true;
        }
      }
      return false;
    });
    console.log(`Section header visible (Expected true): ${headerVisible ? 'PASS' : 'FAIL'}`);
    
    // 6. No horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`No horizontal overflow (Expected false): ${!hasHorizontalOverflow ? 'PASS' : 'FAIL'} - overflow is ${hasHorizontalOverflow}`);
    
    await page.close();
  };

  await checkViewport(contextDesktop, 'desktop', false);
  await checkViewport(contextMobile, 'mobile', true);
  
  await browser.close();
})();
