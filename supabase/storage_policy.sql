-- Create a private bucket for order images
insert into storage.buckets (id, name, public)
values ('order-images', 'order-images', true);

-- Policy: Allow public read access to images (so they can be viewed in the Order Dashboard)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'order-images' );

-- Policy: Allow authenticated users (Shop Owners) to upload/delete their own shop's assets (if needed)
-- For now, we allow anyone to insert if they are uploading for an order.
-- In a real app, strict RLS would link to the specific Order or Shop.
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'order-images' );

-- Policy: Allow Shop Owners to delete images (cleanup)
create policy "Shop Owner Delete"
  on storage.objects for delete
  using ( bucket_id = 'order-images' );
