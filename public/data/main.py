import pandas as pd
import os

# List of your CSV filenames
files = ['AAPL.csv', 'ABB.csv', 'HPQ.csv', 'MSFT.csv', 'NVDA.csv']

merged_df = None

for f in files:
    # Get the stock name from the filename (e.g., 'AAPL' from 'AAPL.csv')
    ticker = os.path.splitext(f)[0] 
    
    try:
        df = pd.read_csv(f)
        
        # Ensure the Date column is in datetime format
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Select and rename the relevant price column
        # Most files have a 'Close' column, but MSFT had a 'MSFT' column
        if 'Close' in df.columns:
            df = df[['Date', 'Close']].rename(columns={'Close': ticker})
        elif ticker in df.columns:
            df = df[['Date', ticker]]
        elif 'MSFT' in df.columns and ticker == 'MSFT': # Specific check for MSFT
            df = df[['Date', 'MSFT']]
        else:
            print(f"Skipping {f}: Could not find 'Close' or '{ticker}' column.")
            continue

        # Merge with the main dataframe
        if merged_df is None:
            merged_df = df
        else:
            # Outer join ensures we keep dates even if they only exist in one file
            merged_df = pd.merge(merged_df, df, on='Date', how='outer')
            
    except Exception as e:
        print(f"Error processing {f}: {e}")

# Sort the final result chronologically
if merged_df is not None:
    merged_df = merged_df.sort_values('Date').reset_index(drop=True)

    # Save to a new CSV file
    output_filename = 'merged_stocks.csv'
    merged_df.to_csv(output_filename, index=False)
    print(f"Successfully created {output_filename}")
    print(merged_df.head())
else:
    print("No data was merged.")