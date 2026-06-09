from Bio import AlignIO

alignment = AlignIO.read("alignment.fas", "fasta")

print("Number of sequences:", len(alignment))
print("Alignment length:", alignment.get_alignment_length())